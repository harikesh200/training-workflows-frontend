import { CheckIcon, CircleIcon, LoaderCircleIcon } from "lucide-react";

import type {
    PublicWorkflow,
    WorkflowStep,
} from "@/features/workflows/types/workflow.types";
import { cn } from "@/lib/utils";

const timelineStages = [
    { step: "queued", label: "Queued", progress: 0 },
    { step: "uploads_saved", label: "Uploads saved", progress: 5 },
    { step: "log_analysis", label: "Log analysis", progress: 20 },
    { step: "purchase_orders", label: "Purchase orders", progress: 45 },
    { step: "vendor_emails", label: "Vendor emails", progress: 65 },
    { step: "summary_report", label: "Summary report", progress: 85 },
    {
        step: "plant_head_email",
        label: "Plant-head email",
        progress: 95,
    },
    { step: "completed", label: "Completed", progress: 100 },
] as const satisfies readonly {
    step: Exclude<WorkflowStep, "failed">;
    label: string;
    progress: number;
}[];

type TimelineState = "completed" | "current" | "upcoming";

function getActiveStageIndex(workflow: PublicWorkflow): number {
    if (workflow.status === "succeeded") {
        return timelineStages.length - 1;
    }

    const activeIndex = timelineStages.findIndex(
        (stage) => stage.step === workflow.currentStep,
    );
    return activeIndex >= 0 ? activeIndex : 0;
}

function getTimelineState(
    workflow: PublicWorkflow,
    stageIndex: number,
    activeIndex: number,
): TimelineState {
    if (workflow.status === "succeeded") {
        return "completed";
    }
    if (workflow.status === "failed") {
        const stage = timelineStages[stageIndex];
        return stage !== undefined && stage.progress < workflow.progress
            ? "completed"
            : "upcoming";
    }
    if (stageIndex < activeIndex) {
        return "completed";
    }
    if (stageIndex === activeIndex) {
        return "current";
    }
    return "upcoming";
}

const timelineStateLabels = {
    completed: "Completed",
    current: "Current",
    upcoming: "Upcoming",
} as const;

export type WorkflowTimelineProps = Readonly<{
    workflow: PublicWorkflow;
}>;

export function WorkflowTimeline({ workflow }: WorkflowTimelineProps) {
    const activeIndex = getActiveStageIndex(workflow);

    return (
        <ol className="space-y-0" aria-label="Workflow stages">
            {timelineStages.map((stage, index) => {
                const state = getTimelineState(workflow, index, activeIndex);
                const isLast = index === timelineStages.length - 1;
                const StateIcon =
                    state === "completed"
                        ? CheckIcon
                        : state === "current"
                            ? LoaderCircleIcon
                            : CircleIcon;

                return (
                    <li
                        key={stage.step}
                        data-step={stage.step}
                        className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3"
                    >
                        <div className="flex flex-col items-center">
                            <span
                                className={cn(
                                    "flex size-8 items-center justify-center border bg-background",
                                    state === "completed" &&
                                        "border-primary bg-primary text-primary-foreground",
                                    state === "current" && "border-foreground",
                                    state === "upcoming" &&
                                        "border-border text-muted-foreground",
                                )}
                            >
                                <StateIcon
                                    className={cn(
                                        "size-4",
                                        state === "current" &&
                                            "motion-safe:animate-spin motion-reduce:animate-none",
                                    )}
                                    aria-hidden="true"
                                />
                            </span>
                            {!isLast ? (
                                <span
                                    className={cn(
                                        "min-h-8 w-px flex-1 bg-border",
                                        state === "completed" && "bg-primary",
                                    )}
                                    aria-hidden="true"
                                />
                            ) : null}
                        </div>
                        <div className={cn("min-w-0 pb-5", isLast && "pb-0")}>
                            <div className="flex flex-wrap items-baseline justify-between gap-2 pt-1">
                                <p
                                    className={cn(
                                        "text-sm font-semibold",
                                        state === "upcoming" &&
                                            "text-muted-foreground",
                                    )}
                                >
                                    {stage.label}
                                </p>
                                <span className="text-xs font-medium text-muted-foreground">
                                    {timelineStateLabels[state]}
                                </span>
                            </div>
                            <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                                {stage.progress}% milestone
                            </p>
                        </div>
                    </li>
                );
            })}
        </ol>
    );
}
