import { z } from "zod";

export const workflowStatusSchema = z.enum([
    "queued",
    "running",
    "succeeded",
    "failed",
]);

export const workflowRunningStepSchema = z.enum([
    "uploads_saved",
    "log_analysis",
    "purchase_orders",
    "vendor_emails",
    "summary_report",
    "plant_head_email",
]);

export const workflowStepSchema = z.enum([
    "queued",
    "uploads_saved",
    "log_analysis",
    "purchase_orders",
    "vendor_emails",
    "summary_report",
    "plant_head_email",
    "completed",
    "failed",
]);

const publicWorkflowBaseSchema = z.object({
    id: z.string().min(1),
    progress: z.number().int().min(0).max(100),
    senderEmail: z.email(),
    vendorEmailList: z.array(z.email()),
    resolvedVendorEmails: z.record(z.string(), z.email()),
    plantHeadEmail: z.email(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});

const queuedWorkflowSchema = publicWorkflowBaseSchema.extend({
    status: z.literal("queued"),
    currentStep: z.literal("queued"),
    error: z.null(),
    completedAt: z.null(),
});

const runningWorkflowSchema = publicWorkflowBaseSchema.extend({
    status: z.literal("running"),
    currentStep: workflowRunningStepSchema,
    error: z.null(),
    completedAt: z.null(),
});

const succeededWorkflowSchema = publicWorkflowBaseSchema.extend({
    status: z.literal("succeeded"),
    currentStep: z.literal("completed"),
    progress: z.literal(100),
    error: z.null(),
    completedAt: z.iso.datetime(),
});

const failedWorkflowSchema = publicWorkflowBaseSchema.extend({
    status: z.literal("failed"),
    currentStep: z.literal("failed"),
    error: z.string().min(1),
    completedAt: z.iso.datetime(),
});

export const publicWorkflowSchema = z.discriminatedUnion("status", [
    queuedWorkflowSchema,
    runningWorkflowSchema,
    succeededWorkflowSchema,
    failedWorkflowSchema,
]);

export const healthResponseSchema = z.object({
    data: z.object({
        status: z.literal("ok"),
    }),
});

export const createWorkflowResponseSchema = z.object({
    data: z.object({
        id: z.string().min(1),
        status: z.literal("queued"),
        currentStep: z.literal("queued"),
        progress: z.literal(0),
    }),
});

export const workflowResponseSchema = z.object({
    data: publicWorkflowSchema,
});
