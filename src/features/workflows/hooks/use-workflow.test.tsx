import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import { type ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { createQueryClient } from "@/app/query-client";
import { useWorkflow } from "@/features/workflows/hooks/use-workflow";
import { apiClient } from "@/shared/lib/api-client";
import { ApiError } from "@/shared/lib/api-error";
import { server } from "@/test/mocks/server";
import {
    makeFailedWorkflow,
    makeQueuedWorkflow,
    makeRunningWorkflow,
    makeSucceededWorkflow,
} from "@/test/workflow-fixtures";

function createWrapper() {
    const queryClient = createQueryClient();

    return function QueryWrapper({
        children,
    }: Readonly<{ children: ReactNode }>) {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    };
}

describe("useWorkflow polling", () => {
    it("polls queued and running workflows, then stops after success", async () => {
        let requestCount = 0;
        server.use(
            http.get(
                "http://localhost:3000/v1/workflows/wf_poll-success",
                () => {
                    requestCount += 1;
                    const workflow =
                        requestCount === 1
                            ? makeQueuedWorkflow({ id: "wf_poll-success" })
                            : requestCount === 2
                              ? makeRunningWorkflow({ id: "wf_poll-success" })
                              : makeSucceededWorkflow({
                                    id: "wf_poll-success",
                                });
                    return HttpResponse.json({ data: workflow });
                },
            ),
        );

        const { result } = renderHook(
            () => useWorkflow("wf_poll-success", 10),
            { wrapper: createWrapper() },
        );

        await waitFor(
            () => expect(result.current.data?.status).toBe("succeeded"),
            { timeout: 1_000 },
        );
        expect(requestCount).toBe(3);

        await delay(50);
        expect(requestCount).toBe(3);
    });

    it("stops polling after a failed workflow response", async () => {
        let requestCount = 0;
        server.use(
            http.get(
                "http://localhost:3000/v1/workflows/wf_poll-failed",
                () => {
                    requestCount += 1;
                    return HttpResponse.json({
                        data:
                            requestCount === 1
                                ? makeRunningWorkflow({ id: "wf_poll-failed" })
                                : makeFailedWorkflow({ id: "wf_poll-failed" }),
                    });
                },
            ),
        );

        const { result } = renderHook(() => useWorkflow("wf_poll-failed", 10), {
            wrapper: createWrapper(),
        });

        await waitFor(
            () => expect(result.current.data?.status).toBe("failed"),
            { timeout: 1_000 },
        );
        expect(requestCount).toBe(2);

        await delay(50);
        expect(requestCount).toBe(2);
    });

    it("stops polling and does not retry after a 404", async () => {
        let requestCount = 0;
        server.use(
            http.get(
                "http://localhost:3000/v1/workflows/wf_poll-missing",
                () => {
                    requestCount += 1;
                    if (requestCount === 1) {
                        return HttpResponse.json({
                            data: makeRunningWorkflow({
                                id: "wf_poll-missing",
                            }),
                        });
                    }
                    return HttpResponse.json(
                        {
                            error: {
                                code: "NOT_FOUND",
                                message: "Workflow not found",
                                details: null,
                            },
                        },
                        { status: 404 },
                    );
                },
            ),
        );

        const { result } = renderHook(
            () => useWorkflow("wf_poll-missing", 10),
            { wrapper: createWrapper() },
        );

        await waitFor(
            () => {
                expect(result.current.error).toBeInstanceOf(ApiError);
                if (!(result.current.error instanceof ApiError)) {
                    throw new Error("Expected an ApiError");
                }
                expect(result.current.error.status).toBe(404);
            },
            { timeout: 1_000 },
        );
        expect(requestCount).toBe(2);

        await delay(50);
        expect(requestCount).toBe(2);
    });

    it("aborts the in-flight Axios request when the observer unmounts", async () => {
        let requestSignal: AbortSignal | null = null;
        const interceptorId = apiClient.interceptors.request.use((request) => {
            if (request.signal instanceof AbortSignal) {
                requestSignal = request.signal;
            }
            return request;
        });

        server.use(
            http.get(
                "http://localhost:3000/v1/workflows/wf_cancel",
                async () => {
                    await delay(200);
                    return HttpResponse.json({
                        data: makeRunningWorkflow({ id: "wf_cancel" }),
                    });
                },
            ),
        );

        const { unmount } = renderHook(() => useWorkflow("wf_cancel", 10), {
            wrapper: createWrapper(),
        });
        await waitFor(() => expect(requestSignal).not.toBeNull());
        unmount();

        await waitFor(() => expect(requestSignal?.aborted).toBe(true));
        apiClient.interceptors.request.eject(interceptorId);
    });
});
