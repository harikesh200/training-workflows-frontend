import { createFileRoute } from "@tanstack/react-router";

import { WorkflowCreationPage } from "@/features/workflows/components/workflow-creation-page";

export const Route = createFileRoute("/")({
    component: WorkflowCreationPage,
});
