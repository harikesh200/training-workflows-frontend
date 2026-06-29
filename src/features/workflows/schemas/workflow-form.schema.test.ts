import { describe, expect, it } from "vitest";

import {
    MAX_WORKFLOW_FILE_BYTES,
    workflowFormSchema,
} from "@/features/workflows/schemas/workflow-form.schema";

function csvFile(name = "data.csv", type = "text/csv"): File {
    return new File(["column\nvalue"], name, { type });
}

function validFormInput() {
    return {
        machineLogs: csvFile("machine-logs.csv"),
        errorManual: new File(["pdf"], "manual.pdf", {
            type: "application/pdf",
        }),
        vendorCatalog: csvFile("vendors.csv"),
        senderEmail: "sender@example.com",
        senderPassword: "app-password",
        vendorEmails: [{ email: "vendor@example.com" }],
        plantHeadEmail: "plant@example.com",
    };
}

describe("workflowFormSchema", () => {
    it("rejects missing required fields and files", () => {
        const result = workflowFormSchema.safeParse({});

        expect(result.success).toBe(false);
        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;
            expect(fieldErrors.machineLogs).toBeDefined();
            expect(fieldErrors.errorManual).toBeDefined();
            expect(fieldErrors.vendorCatalog).toBeDefined();
            expect(fieldErrors.senderPassword).toBeDefined();
            expect(fieldErrors.vendorEmails).toBeDefined();
        }
    });

    it("rejects invalid sender, vendor, and plant-head emails", () => {
        const result = workflowFormSchema.safeParse({
            ...validFormInput(),
            senderEmail: "not-an-email",
            vendorEmails: [{ email: "also-invalid" }],
            plantHeadEmail: "invalid",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(
                result.error.issues.filter(
                    (issue) => issue.code === "invalid_format",
                ),
            ).toHaveLength(3);
        }
    });

    it("rejects files with an invalid extension or MIME type", () => {
        const result = workflowFormSchema.safeParse({
            ...validFormInput(),
            machineLogs: new File(["log"], "machine-logs.txt", {
                type: "text/plain",
            }),
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.machineLogs).toContain(
                "Choose a CSV file for machine logs.",
            );
        }
    });

    it("rejects files larger than 10 MiB", () => {
        const oversizedFile = new File(
            [new Uint8Array(MAX_WORKFLOW_FILE_BYTES + 1)],
            "machine-logs.csv",
            { type: "text/csv" },
        );
        const result = workflowFormSchema.safeParse({
            ...validFormInput(),
            machineLogs: oversizedFile,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.machineLogs).toContain(
                "File must not exceed 10 MiB.",
            );
        }
    });

    it("accepts a valid extension when the browser omits MIME information", () => {
        const result = workflowFormSchema.safeParse({
            ...validFormInput(),
            machineLogs: csvFile("machine-logs.csv", ""),
            vendorCatalog: csvFile("vendors.csv", ""),
        });

        expect(result.success).toBe(true);
    });
});
