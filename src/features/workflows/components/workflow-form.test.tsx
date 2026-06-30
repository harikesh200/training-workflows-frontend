import { QueryClientProvider } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import { userEvent, type UserEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { createQueryClient } from "@/app/query-client";
import { WorkflowForm } from "@/features/workflows/components/workflow-form";
import { renderApp } from "@/test/render-app";
import { server } from "@/test/mocks/server";
import { makeSucceededWorkflow } from "@/test/workflow-fixtures";
import { render } from "@testing-library/react";

function renderWorkflowForm(
    onCreated: (workflowId: string) => void | Promise<void> = vi.fn(),
) {
    const queryClient = createQueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            <WorkflowForm onCreated={onCreated} />
        </QueryClientProvider>,
    );
}

function csvFile(name: string): File {
    return new File(["header\nvalue"], name, { type: "text/csv" });
}

async function fillValidWorkflowForm(
    user: UserEvent,
    vendorEmail = "vendor@example.com",
): Promise<void> {
    await user.upload(
        screen.getByLabelText("Machine logs CSV"),
        csvFile("machine-logs.csv"),
    );
    await user.upload(
        screen.getByLabelText("Error manual PDF"),
        new File(["pdf"], "error-manual.pdf", { type: "application/pdf" }),
    );
    await user.upload(
        screen.getByLabelText("Vendor catalog CSV"),
        csvFile("vendor-catalog.csv"),
    );
    await user.type(
        screen.getByLabelText("SMTP sender email"),
        "sender@example.com",
    );
    await user.type(screen.getByLabelText("SMTP app password"), "smtp-secret");
    await user.type(screen.getByLabelText("Vendor email 1"), vendorEmail);
    await user.type(
        screen.getByLabelText("Plant-head email"),
        "plant@example.com",
    );
}

function useSuccessfulCreateHandler(
    inspectRequest?: (request: Request) => Promise<void>,
): void {
    server.use(
        http.post("http://localhost:3000/v1/workflows", async ({ request }) => {
            await inspectRequest?.(request);
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
        }),
    );
}

describe("WorkflowForm", () => {
    it("keeps submission disabled while required inputs are missing", () => {
        renderWorkflowForm();

        expect(
            screen.getByRole("button", { name: "Start workflow" }),
        ).toBeDisabled();
    });

    it("renders email validation next to the associated field", async () => {
        const user = userEvent.setup();
        renderWorkflowForm();

        await user.type(
            screen.getByLabelText("SMTP sender email"),
            "invalid-email",
        );
        await user.tab();

        expect(
            await screen.findByText("Enter a valid SMTP sender email."),
        ).toBeInTheDocument();
        expect(screen.getByLabelText("SMTP sender email")).toHaveAttribute(
            "aria-invalid",
            "true",
        );
    });

    it("renders file type validation after native file selection", async () => {
        const user = userEvent.setup({ applyAccept: false });
        renderWorkflowForm();

        await user.upload(
            screen.getByLabelText("Machine logs CSV"),
            new File(["not csv"], "machine-logs.txt", { type: "text/plain" }),
        );

        expect(
            await screen.findByText("Choose a CSV file for machine logs."),
        ).toBeInTheDocument();
    });

    it("adds and removes vendor email controls", async () => {
        const user = userEvent.setup();
        renderWorkflowForm();

        await user.click(screen.getByRole("button", { name: "Add" }));
        expect(screen.getByLabelText("Vendor email 2")).toBeInTheDocument();

        await user.click(
            screen.getByRole("button", { name: "Remove vendor email 1" }),
        );
        expect(
            screen.queryByLabelText("Vendor email 2"),
        ).not.toBeInTheDocument();
        expect(screen.getByLabelText("Vendor email 1")).toBeInTheDocument();
    });

    it("reorders vendor emails without index-based identity loss", async () => {
        const user = userEvent.setup();
        renderWorkflowForm();

        await user.type(
            screen.getByLabelText("Vendor email 1"),
            "first@example.com",
        );
        await user.click(screen.getByRole("button", { name: "Add" }));
        await user.type(
            screen.getByLabelText("Vendor email 2"),
            "second@example.com",
        );
        await user.click(
            screen.getByRole("button", { name: "Move vendor email 2 up" }),
        );

        expect(screen.getByLabelText("Vendor email 1")).toHaveValue(
            "second@example.com",
        );
        expect(screen.getByLabelText("Vendor email 2")).toHaveValue(
            "first@example.com",
        );
    });

    it("keeps vendor and plant-head email values independent", async () => {
        const user = userEvent.setup();
        renderWorkflowForm();
        const vendorEmailInput = screen.getByLabelText("Vendor email 1");
        const plantHeadEmailInput = screen.getByLabelText("Plant-head email");

        await user.type(vendorEmailInput, "vendor@example.com");
        expect(plantHeadEmailInput).toHaveValue("");

        await user.type(plantHeadEmailInput, "plant@example.com");
        expect(vendorEmailInput).toHaveValue("vendor@example.com");
        expect(plantHeadEmailInput).toHaveValue("plant@example.com");
        expect(vendorEmailInput).not.toHaveAttribute(
            "autocomplete",
            plantHeadEmailInput.getAttribute("autocomplete"),
        );
    });

    it("clears the SMTP password immediately after successful creation", async () => {
        const user = userEvent.setup();
        const onCreated = vi.fn();
        useSuccessfulCreateHandler();
        renderWorkflowForm(onCreated);
        await fillValidWorkflowForm(user);

        const submitButton = screen.getByRole("button", {
            name: "Start workflow",
        });
        await waitFor(() => expect(submitButton).toBeEnabled());
        await user.click(submitButton);

        await waitFor(() => expect(onCreated).toHaveBeenCalledOnce());
        expect(screen.getByLabelText("SMTP app password")).toHaveValue("");
    });

    it("supports keyboard operation for password and vendor controls", async () => {
        const user = userEvent.setup();
        renderWorkflowForm();
        const passwordInput = screen.getByLabelText("SMTP app password");
        const showPasswordButton = screen.getByRole("button", {
            name: "Show SMTP app password",
        });

        showPasswordButton.focus();
        await user.keyboard("{Enter}");
        expect(passwordInput).toHaveAttribute("type", "text");

        const addButton = screen.getByRole("button", { name: "Add" });
        addButton.focus();
        await user.keyboard(" ");
        expect(screen.getByLabelText("Vendor email 2")).toBeInTheDocument();
    });
});

describe("workflow creation route", () => {
    it("navigates to the created workflow using typed application routing", async () => {
        const user = userEvent.setup();
        useSuccessfulCreateHandler();
        server.use(
            http.get("http://localhost:3000/v1/workflows/wf_created-123", () =>
                HttpResponse.json({
                    data: makeSucceededWorkflow({ id: "wf_created-123" }),
                }),
            ),
        );
        const { router } = renderApp();
        await screen.findByRole("heading", {
            name: "Start a maintenance workflow",
        });
        await fillValidWorkflowForm(user);

        const submitButton = screen.getByRole("button", {
            name: "Start workflow",
        });
        await waitFor(() => expect(submitButton).toBeEnabled());
        await user.click(submitButton);

        expect(
            await screen.findByRole("heading", { name: "Workflow detail" }),
        ).toBeInTheDocument();
        expect(router.state.location.pathname).toBe(
            "/workflows/wf_created-123",
        );
    });

    it("keeps workflow dispatch available when the health check fails", async () => {
        server.use(
            http.get("http://localhost:3000/health", () =>
                HttpResponse.json(
                    {
                        error: {
                            code: "INTERNAL",
                            message: "Service unavailable",
                            details: null,
                        },
                    },
                    { status: 503 },
                ),
            ),
        );
        renderApp();

        expect(
            await screen.findByText("API unavailable", {}, { timeout: 3_000 }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("heading", {
                name: "Start a maintenance workflow",
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Start workflow" }),
        ).toBeDisabled();
    });
});
