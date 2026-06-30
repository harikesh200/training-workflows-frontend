import { useQuery } from "@tanstack/react-query";

import { workflowQueryKeys } from "@/features/workflows/api/workflow-query-keys";
import { getWorkflow } from "@/features/workflows/api/workflows.api";
import { ApiError, isTransientApiError } from "@/shared/lib/api-error";

export const WORKFLOW_POLL_INTERVAL_MS = 1_500;

export function useWorkflow(
    workflowId: string,
    pollIntervalMs = WORKFLOW_POLL_INTERVAL_MS,
) {
    return useQuery({
        queryKey: workflowQueryKeys.detail(workflowId),
        queryFn: ({ signal }) => getWorkflow(workflowId, signal),
        refetchInterval: (query) => {
            if (
                query.state.error instanceof ApiError &&
                query.state.error.status === 404
            ) {
                return false;
            }

            const status = query.state.data?.status;
            return status === "queued" || status === "running"
                ? pollIntervalMs
                : false;
        },
        retry: (failureCount, error) =>
            failureCount < 2 && isTransientApiError(error),
        retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 1_500),
        refetchOnWindowFocus: false,
    });
}
