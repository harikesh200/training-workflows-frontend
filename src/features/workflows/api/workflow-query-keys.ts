export const workflowQueryKeys = {
    all: ["workflows"] as const,
    detail: (workflowId: string) =>
        [...workflowQueryKeys.all, "detail", workflowId] as const,
    health: ["health"] as const,
};
