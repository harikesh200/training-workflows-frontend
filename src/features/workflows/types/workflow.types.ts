import type { z } from "zod";

import type {
    createWorkflowResponseSchema,
    publicWorkflowSchema,
    workflowArtifactSchema,
    workflowStatusSchema,
    workflowStepSchema,
} from "@/features/workflows/schemas/workflow.schemas";

export type WorkflowStatus = z.infer<typeof workflowStatusSchema>;
export type WorkflowStep = z.infer<typeof workflowStepSchema>;
export type WorkflowArtifact = z.infer<typeof workflowArtifactSchema>;
export type PublicWorkflow = z.infer<typeof publicWorkflowSchema>;
export type CreatedWorkflow = z.infer<
    typeof createWorkflowResponseSchema
>["data"];

export type CreateWorkflowInput = Readonly<{
    machineLogs: File;
    errorManual: File;
    vendorCatalog: File;
    senderEmail: string;
    senderPassword: string;
    vendorEmails: readonly string[];
    plantHeadEmail: string;
}>;
