import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ApiError } from "@/shared/lib/api-error";

export type ApiErrorAlertProps = Readonly<{
    error: Error;
    title?: string;
}>;

export function ApiErrorAlert({
    error,
    title = "Unable to complete the request",
}: ApiErrorAlertProps) {
    const errorCode =
        error instanceof ApiError && error.backendCode !== null
            ? error.backendCode
            : null;

    return (
        <Alert variant="destructive" role="alert">
            <AlertCircleIcon aria-hidden="true" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
                <p>{error.message}</p>
                {errorCode !== null ? (
                    <p className="mt-2 text-xs">Code: {errorCode}</p>
                ) : null}
            </AlertDescription>
        </Alert>
    );
}
