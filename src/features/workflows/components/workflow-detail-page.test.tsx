import { screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { renderApp } from "@/test/render-app";
import { server } from "@/test/mocks/server";
import {
    makeFailedWorkflow,
    makeSucceededWorkflow,
} from "@/test/workflow-fixtures";

describe("WorkflowDetailPage", () => {
    it("renders a failed workflow with text, icon-backed status, and failure alert", async () => {
        server.use(
            http.get("http://localhost:3000/v1/workflows/wf_failed", () =>
                HttpResponse.json({
                    data: makeFailedWorkflow({ id: "wf_failed" }),
                }),
            ),
        );
        renderApp("/workflows/wf_failed");

        expect(
            await screen.findByRole("heading", { name: "Workflow detail" }),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Failed", { selector: '[data-slot="badge"]' }),
        ).toBeInTheDocument();
        expect(screen.getByRole("alert")).toHaveTextContent(
            "Purchase-order generation failed.",
        );
        expect(
            within(
                screen.getByRole("list", { name: "Workflow stages" }),
            ).queryByText("Failed"),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole("progressbar", {
                name: "Workflow completion progress",
            }),
        ).toHaveAttribute("aria-valuenow", "45");
    });

    it("renders a dedicated unknown workflow state after a 404", async () => {
        server.use(
            http.get("http://localhost:3000/v1/workflows/wf_unknown", () =>
                HttpResponse.json(
                    {
                        error: {
                            code: "NOT_FOUND",
                            message: "Workflow not found",
                            details: null,
                        },
                    },
                    { status: 404 },
                ),
            ),
        );
        renderApp("/workflows/wf_unknown");

        expect(
            await screen.findByRole("heading", {
                name: "Workflow not found",
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                "This workflow session is no longer available. It may have expired after completion.",
            ),
        ).toBeInTheDocument();
    });

    it("shows a recoverable network state and retries on user request", async () => {
        const user = userEvent.setup();
        let serviceAvailable = false;
        server.use(
            http.get("http://localhost:3000/v1/workflows/wf_network", () => {
                if (!serviceAvailable) {
                    return HttpResponse.error();
                }
                return HttpResponse.json({
                    data: makeSucceededWorkflow({ id: "wf_network" }),
                });
            }),
        );
        renderApp("/workflows/wf_network");

        expect(
            await screen.findByText(
                "Unable to reach the maintenance workflow service.",
                {},
                { timeout: 3_000 },
            ),
        ).toBeInTheDocument();

        serviceAvailable = true;
        await user.click(screen.getByRole("button", { name: "Retry" }));

        expect(
            await screen.findByRole("heading", { name: "Workflow detail" }),
        ).toBeInTheDocument();
    });
});
