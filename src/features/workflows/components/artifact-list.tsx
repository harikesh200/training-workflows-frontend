import { DownloadIcon, FileOutputIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildArtifactUrl } from "@/features/workflows/api/workflows.api";
import type { WorkflowArtifact } from "@/features/workflows/types/workflow.types";

export type ArtifactListProps = Readonly<{
    workflowId: string;
    artifacts: readonly WorkflowArtifact[];
}>;

export function ArtifactList({ workflowId, artifacts }: ArtifactListProps) {
    if (artifacts.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Artifacts will appear after generation completes.
            </p>
        );
    }

    return (
        <ul className="divide-y border" aria-label="Workflow artifacts">
            {artifacts.map((artifact) => (
                <li
                    key={artifact.name}
                    className="flex min-w-0 flex-col gap-3 p-3 sm:flex-row sm:items-center"
                >
                    <FileOutputIcon
                        className="size-5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="break-all font-mono text-xs font-medium">
                            {artifact.name}
                        </p>
                        <p className="break-all font-mono text-xs text-muted-foreground">
                            {artifact.contentType}
                        </p>
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        className="min-h-11 w-full shrink-0 sm:w-auto"
                    >
                        <a
                            href={buildArtifactUrl(workflowId, artifact.name)}
                            download
                        >
                            <DownloadIcon aria-hidden="true" />
                            Download
                        </a>
                    </Button>
                </li>
            ))}
        </ul>
    );
}
