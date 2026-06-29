import { createFileRoute } from "@tanstack/react-router";

import { WorkflowDetailPage } from "@/features/workflows/components/workflow-detail-page";

function WorkflowRouteComponent() {
    const { workflowId } = Route.useParams();
    return <WorkflowDetailPage workflowId={workflowId} />;
}

export const Route = createFileRoute("/workflows/$workflowId")({
    component: WorkflowRouteComponent,
});
