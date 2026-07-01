import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { createWorkflow } from "@/features/workflows/api/workflows.api";
import { server } from "@/test/mocks/server";

function csvFile(name: string): File {
    return new File(["header\nvalue"], name, { type: "text/csv" });
}

describe("createWorkflow", () => {
    it("serializes the workflow input as browser-managed multipart data", async () => {
        let submittedFields: string[] = [];
        let serializedVendorEmails = "";
        let submittedPlantHeadEmail = "";
        let contentType = "";
        server.use(
            http.post(
                "http://localhost:3000/v1/workflows",
                async ({ request }) => {
                    contentType = request.headers.get("content-type") ?? "";
                    const body = await request.text();
                    submittedFields = Array.from(
                        body.matchAll(/;\s*name="([^"]+)"/g),
                        (match) => match[1] ?? "",
                    );
                    serializedVendorEmails =
                        body.match(
                            /name="vendorEmails"\r?\n\r?\n([^\r\n]+)/,
                        )?.[1] ?? "";
                    submittedPlantHeadEmail =
                        body.match(
                            /name="plantHeadEmail"\r?\n\r?\n([^\r\n]+)/,
                        )?.[1] ?? "";
                    return HttpResponse.json(
                        {
                            data: {
                                id: "wf_created-123",
                                status: "queued",
                                currentStep: "queued",
                                progress: 0,
                            },
                        },
                        { status: 202 },
                    );
                },
            ),
        );

        const result = await createWorkflow({
            machineLogs: csvFile("machine-logs.csv"),
            errorManual: new File(["pdf"], "error-manual.pdf", {
                type: "application/pdf",
            }),
            vendorCatalog: csvFile("vendor-catalog.csv"),
            senderEmail: "sender@example.com",
            senderPassword: "smtp-secret",
            vendorEmails: ["vendor@example.com", "backup@example.com"],
            plantHeadEmail: "plant@example.com",
        });

        expect(result.id).toBe("wf_created-123");
        expect(submittedFields).toEqual([
            "machineLogs",
            "errorManual",
            "vendorCatalog",
            "senderEmail",
            "senderPassword",
            "vendorEmails",
            "plantHeadEmail",
        ]);
        expect(serializedVendorEmails).toBe(
            JSON.stringify(["vendor@example.com", "backup@example.com"]),
        );
        expect(submittedPlantHeadEmail).toBe("plant@example.com");
        expect(contentType).toMatch(/^multipart\/form-data;\s*boundary=/i);
    });
});
