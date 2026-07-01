import { Progress } from "@/components/ui/progress";

export type WorkflowProgressProps = Readonly<{
    progress: number;
}>;

export function WorkflowProgress({ progress }: WorkflowProgressProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-4">
                <p className="text-sm font-semibold">Server progress</p>
                <p className="text-base font-semibold tabular-nums">
                    {progress}%
                </p>
            </div>
            <Progress
                value={progress}
                className="h-2 **:data-[slot=progress-indicator]:motion-reduce:transition-none"
                aria-label="Workflow completion progress"
            />
        </div>
    );
}
