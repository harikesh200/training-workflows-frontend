import { z } from "zod";

export const MAX_WORKFLOW_FILE_BYTES = 10 * 1024 * 1024;

type FileRule = Readonly<{
    extension: string;
    mimeTypes: readonly string[];
    requiredMessage: string;
    typeMessage: string;
}>;

function isBrowserFile(value: unknown): value is File {
    return typeof File !== "undefined" && value instanceof File;
}

function workflowFileSchema(rule: FileRule) {
    return z
        .custom<File>(isBrowserFile, {
            error: rule.requiredMessage,
        })
        .superRefine((file, context) => {
            if (!isBrowserFile(file)) {
                return;
            }

            const hasExpectedExtension = file.name
                .toLowerCase()
                .endsWith(rule.extension);
            const hasReasonableMime =
                file.type === "" ||
                rule.mimeTypes.includes(file.type.toLowerCase());

            if (!hasExpectedExtension || !hasReasonableMime) {
                context.addIssue({
                    code: "custom",
                    message: rule.typeMessage,
                });
            }

            if (file.size > MAX_WORKFLOW_FILE_BYTES) {
                context.addIssue({
                    code: "too_big",
                    origin: "file",
                    maximum: MAX_WORKFLOW_FILE_BYTES,
                    inclusive: true,
                    message: "File must not exceed 10 MB.",
                });
            }
        });
}

export const workflowFormSchema = z.object({
    machineLogs: workflowFileSchema({
        extension: ".csv",
        mimeTypes: [
            "text/csv",
            "text/plain",
            "application/csv",
            "application/vnd.ms-excel",
        ],
        requiredMessage: "Machine logs CSV is required.",
        typeMessage: "Choose a CSV file for machine logs.",
    }),
    errorManual: workflowFileSchema({
        extension: ".pdf",
        mimeTypes: ["application/pdf", "application/x-pdf"],
        requiredMessage: "Error manual PDF is required.",
        typeMessage: "Choose a PDF file for the error manual.",
    }),
    vendorCatalog: workflowFileSchema({
        extension: ".csv",
        mimeTypes: [
            "text/csv",
            "text/plain",
            "application/csv",
            "application/vnd.ms-excel",
        ],
        requiredMessage: "Vendor catalog CSV is required.",
        typeMessage: "Choose a CSV file for the vendor catalog.",
    }),
    senderEmail: z.email("Enter a valid SMTP sender email."),
    senderPassword: z.string().min(1, "SMTP app password is required."),
    vendorEmails: z
        .array(
            z.object({
                email: z.email("Enter a valid vendor email."),
            }),
        )
        .min(1, "Add at least one vendor email."),
    plantHeadEmail: z.email("Enter a valid plant-head email."),
});

export type WorkflowFormValues = z.infer<typeof workflowFormSchema>;
