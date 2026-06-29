import { useNavigate } from '@tanstack/react-router'
import { ClipboardListIcon, ShieldCheckIcon } from 'lucide-react'

import { ResumeWorkflowForm } from '@/features/workflows/components/resume-workflow-form'
import { WorkflowForm } from '@/features/workflows/components/workflow-form'

export function WorkflowCreationPage() {
  const navigate = useNavigate()

  function openWorkflow(workflowId: string): Promise<void> {
    return navigate({
      to: '/workflows/$workflowId',
      params: { workflowId },
    })
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 border-b pb-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
        <div className="max-w-3xl space-y-4">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            <ClipboardListIcon className="size-4" aria-hidden="true" />
            Workflow dispatch
          </p>
          <h1 className="font-heading text-display font-semibold">
            Start a maintenance workflow
          </h1>
          <p className="max-w-2xl text-base/7 text-muted-foreground sm:text-lg/8">
            Upload machine evidence, define ordered mail routing, and monitor
            the backend pipeline from intake through plant-head delivery.
          </p>
          <div className="flex items-start gap-2 text-sm/6 text-muted-foreground">
            <ShieldCheckIcon
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            Credentials and file selections are never persisted by this
            frontend.
          </div>
        </div>
        <div className="border bg-card p-4">
          <ResumeWorkflowForm onResume={openWorkflow} />
        </div>
      </section>

      <WorkflowForm onCreated={openWorkflow} />
    </div>
  )
}
