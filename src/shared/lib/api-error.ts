import axios from "axios";
import { z } from "zod";

const backendErrorEnvelopeSchema = z.object({
    error: z.object({
        code: z.string().min(1),
        message: z.string().min(1),
        details: z.unknown().optional(),
    }),
});

type ApiErrorOptions = Readonly<{
    status: number | null;
    backendCode: string | null;
    details: unknown;
    isNetworkError: boolean;
}>;

export class ApiError extends Error {
    public readonly status: number | null;
    public readonly backendCode: string | null;
    public readonly details: unknown;
    public readonly isNetworkError: boolean;

    public constructor(message: string, options: ApiErrorOptions) {
        super(message);
        this.name = "ApiError";
        this.status = options.status;
        this.backendCode = options.backendCode;
        this.details = options.details;
        this.isNetworkError = options.isNetworkError;
    }
}

export class ResponseValidationError extends Error {
    public constructor(resource: string) {
        super(`The server returned an invalid ${resource} response.`);
        this.name = "ResponseValidationError";
    }
}

function fallbackHttpMessage(status: number): string {
    if (status === 404) {
        return "The requested resource was not found.";
    }
    if (status === 429) {
        return "Too many requests. Wait briefly and try again.";
    }
    if (status >= 500) {
        return "The service is temporarily unavailable.";
    }
    return "The request could not be completed.";
}

export function normalizeApiError(error: unknown): ApiError {
    if (error instanceof ApiError) {
        return error;
    }

    if (!axios.isAxiosError(error)) {
        return new ApiError("The request could not be completed.", {
            status: null,
            backendCode: null,
            details: null,
            isNetworkError: false,
        });
    }

    if (axios.isCancel(error)) {
        return new ApiError("The request was cancelled.", {
            status: null,
            backendCode: "REQUEST_CANCELLED",
            details: null,
            isNetworkError: false,
        });
    }

    const status = error.response?.status ?? null;
    const parsedEnvelope = backendErrorEnvelopeSchema.safeParse(
        error.response?.data,
    );

    if (parsedEnvelope.success) {
        return new ApiError(parsedEnvelope.data.error.message, {
            status,
            backendCode: parsedEnvelope.data.error.code,
            details: parsedEnvelope.data.error.details ?? null,
            isNetworkError: false,
        });
    }

    if (status === null) {
        return new ApiError(
            "Unable to reach the maintenance workflow service.",
            {
                status: null,
                backendCode: "NETWORK_ERROR",
                details: null,
                isNetworkError: true,
            },
        );
    }

    return new ApiError(fallbackHttpMessage(status), {
        status,
        backendCode: "HTTP_ERROR",
        details: null,
        isNetworkError: false,
    });
}

export function isTransientApiError(error: unknown): boolean {
    return (
        error instanceof ApiError &&
        (error.isNetworkError ||
            error.status === 429 ||
            (error.status !== null && error.status >= 500))
    );
}
