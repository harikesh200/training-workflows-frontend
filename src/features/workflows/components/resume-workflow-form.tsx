import { ArrowRightIcon, RotateCcwIcon } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ResumeWorkflowFormProps = Readonly<{
    onResume: (workflowId: string) => void | Promise<void>;
}>;

export function ResumeWorkflowForm({ onResume }: ResumeWorkflowFormProps) {
    const [workflowId, setWorkflowId] = useState("");
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const normalizedId = workflowId.trim();
        if (normalizedId.length === 0) {
            setError("Enter a workflow ID.");
            return;
        }
        setError(null);
        await onResume(normalizedId);
    }

    return (
        <form className="space-y-3" noValidate onSubmit={handleSubmit}>
            <div className="flex items-center gap-2 font-heading text-base font-semibold tracking-tight">
                <RotateCcwIcon className="size-4" aria-hidden="true" />
                Resume a workflow
            </div>
            <p className="text-sm/6 text-muted-foreground">
                Open an existing job using its workflow ID.
            </p>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div className="space-y-2">
                    <Label htmlFor="resume-workflow-id">Workflow ID</Label>
                    <Input
                        id="resume-workflow-id"
                        className="h-11 font-mono"
                        value={workflowId}
                        placeholder="wf_..."
                        autoComplete="off"
                        aria-invalid={error !== null}
                        aria-describedby={
                            error === null
                                ? "resume-workflow-help"
                                : "resume-workflow-error"
                        }
                        onChange={(event) =>
                            setWorkflowId(event.currentTarget.value)
                        }
                    />
                </div>
                <Button type="submit" className="min-h-11 self-end">
                    Open
                    <ArrowRightIcon aria-hidden="true" />
                </Button>
            </div>
            <p
                id="resume-workflow-help"
                className="text-xs text-muted-foreground"
            >
                IDs are shown after workflow creation.
            </p>
            {error !== null ? (
                <p
                    id="resume-workflow-error"
                    className="text-xs text-destructive"
                    role="alert"
                >
                    {error}
                </p>
            ) : null}
        </form>
    );
}
