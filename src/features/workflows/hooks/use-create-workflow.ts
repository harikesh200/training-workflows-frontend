import { useMutation } from "@tanstack/react-query";

import { createWorkflow } from "@/features/workflows/api/workflows.api";

export function useCreateWorkflow() {
    return useMutation({
        mutationFn: createWorkflow,
        retry: false,
        gcTime: 0,
    });
}
