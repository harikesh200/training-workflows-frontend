import type { ZodType } from "zod";

import {
    createWorkflowResponseSchema,
    healthResponseSchema,
    workflowResponseSchema,
} from "@/features/workflows/schemas/workflow.schemas";
import type {
    CreatedWorkflow,
    CreateWorkflowInput,
    PublicWorkflow,
} from "@/features/workflows/types/workflow.types";
import { apiClient } from "@/shared/lib/api-client";
import { ResponseValidationError } from "@/shared/lib/api-error";

function parseApiResponse<T>(
    schema: ZodType<T>,
    value: unknown,
    resource: string,
): T {
    const parsed = schema.safeParse(value);
    if (!parsed.success) {
        throw new ResponseValidationError(resource);
    }
    return parsed.data;
}

export async function getHealth(signal: AbortSignal): Promise<"ok"> {
    const response = await apiClient.get("/health", { signal });
    return parseApiResponse(healthResponseSchema, response.data, "health check")
        .data.status;
}

export async function createWorkflow(
    input: CreateWorkflowInput,
): Promise<CreatedWorkflow> {
    const formData = new FormData();
    formData.append("machineLogs", input.machineLogs);
    formData.append("errorManual", input.errorManual);
    formData.append("vendorCatalog", input.vendorCatalog);
    formData.append("senderEmail", input.senderEmail);
    formData.append("senderPassword", input.senderPassword);
    formData.append("vendorEmails", JSON.stringify(input.vendorEmails));
    formData.append("plantHeadEmail", input.plantHeadEmail);

    const response = await apiClient.post("/v1/workflows", formData);
    if (response.status !== 202) {
        throw new ResponseValidationError("workflow creation");
    }

    return parseApiResponse(
        createWorkflowResponseSchema,
        response.data,
        "workflow creation",
    ).data;
}

export async function getWorkflow(
    workflowId: string,
    signal: AbortSignal,
): Promise<PublicWorkflow> {
    const response = await apiClient.get(
        `/v1/workflows/${encodeURIComponent(workflowId)}`,
        { signal },
    );
    return parseApiResponse(workflowResponseSchema, response.data, "workflow")
        .data;
}
