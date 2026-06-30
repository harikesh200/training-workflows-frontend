import { useQuery } from "@tanstack/react-query";

import { getHealth } from "@/features/workflows/api/workflows.api";
import { workflowQueryKeys } from "@/features/workflows/api/workflow-query-keys";
import { isTransientApiError } from "@/shared/lib/api-error";

export function useApiHealth() {
    return useQuery({
        queryKey: workflowQueryKeys.health,
        queryFn: ({ signal }) => getHealth(signal),
        staleTime: 15_000,
        refetchInterval: 30_000,
        retry: (failureCount, error) =>
            failureCount < 1 && isTransientApiError(error),
    });
}
