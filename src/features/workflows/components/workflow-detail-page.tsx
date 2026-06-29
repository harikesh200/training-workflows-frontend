import { Link } from '@tanstack/react-router'
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  ClipboardCopyIcon,
  Clock3Icon,
  MailIcon,
  RefreshCwIcon,
} from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ApiErrorAlert } from '@/features/workflows/components/api-error-alert'
import { ArtifactList } from '@/features/workflows/components/artifact-list'
import { ResolvedVendorList } from '@/features/workflows/components/resolved-vendor-list'
import { WorkflowDetailSkeleton } from '@/features/workflows/components/workflow-detail-skeleton'
import { WorkflowProgress } from '@/features/workflows/components/workflow-progress'
import { WorkflowStatusBadge } from '@/features/workflows/components/workflow-status-badge'
import { WorkflowTimeline } from '@/features/workflows/components/workflow-timeline'
import { useWorkflow } from '@/features/workflows/hooks/use-workflow'
import type { PublicWorkflow } from '@/features/workflows/types/workflow.types'
import { ApiError, isTransientApiError } from '@/shared/lib/api-error'

const timestampFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'medium',
})

function formatTimestamp(timestamp: string): string {
  return timestampFormatter.format(new Date(timestamp))
}

function safeWorkflowFailure(message: string): string {
  const collapsedMessage = message.replace(/\s+/g, ' ').trim()
  if (
    collapsedMessage.length === 0 ||
    /\bat\s+\S+\s+\(/i.test(collapsedMessage)
  ) {
    return 'The workflow stopped during execution. Review the inputs and server logs before retrying with a new workflow.'
  }
  return collapsedMessage.slice(0, 280)
}

type TimestampRowProps = Readonly<{
  label: string
  timestamp: string
}>

function TimestampRow({ label, timestamp }: TimestampRowProps) {
  return (
    <div className="grid gap-1 sm:grid-cols-[7rem_minmax(0,1fr)]">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd>
        <time
          dateTime={timestamp}
          className="break-words font-mono text-xs tabular-nums"
        >
          {formatTimestamp(timestamp)}
        </time>
      </dd>
    </div>
  )
}

type WorkflowDetailProps = Readonly<{
  workflow: PublicWorkflow
}>

function WorkflowDetail({ workflow }: WorkflowDetailProps) {
  const [copyState, setCopyState] = useState<
    'idle' | 'copied' | 'failed'
  >('idle')

  async function copyWorkflowId(): Promise<void> {
    try {
      await navigator.clipboard.writeText(workflow.id)
      setCopyState('copied')
    } catch {
      setCopyState('failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeftIcon aria-hidden="true" />
            Start another workflow
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-page-title font-semibold">
              Workflow detail
            </h1>
            <WorkflowStatusBadge status={workflow.status} />
          </div>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            <p className="min-w-0 break-all font-mono text-xs tabular-nums text-muted-foreground">
              {workflow.id}
            </p>
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 self-start sm:self-auto"
              onClick={() => void copyWorkflowId()}
            >
              <ClipboardCopyIcon aria-hidden="true" />
              Copy ID
            </Button>
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {copyState === 'copied'
              ? 'Workflow ID copied.'
              : copyState === 'failed'
                ? 'Unable to copy workflow ID.'
                : ''}
          </p>
        </div>
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          Workflow status {workflow.status}, {workflow.progress}% complete.
        </div>
      </div>

      {workflow.status === 'failed' ? (
        <Alert variant="destructive" role="alert">
          <AlertTriangleIcon aria-hidden="true" />
          <AlertTitle>Workflow failed</AlertTitle>
          <AlertDescription>
            {safeWorkflowFailure(workflow.error)}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(19rem,0.75fr)]">
        <div className="min-w-0 space-y-6">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Execution</CardTitle>
              <CardDescription>
                Live state reported by the workflow service.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <WorkflowProgress progress={workflow.progress} />
              <Separator />
              <WorkflowTimeline workflow={workflow} />
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle>Artifacts</CardTitle>
              <CardDescription>
                Download generated analyses, invoices, and summaries.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ArtifactList
                workflowId={workflow.id}
                artifacts={workflow.artifacts}
              />
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock3Icon className="size-4" aria-hidden="true" />
                Timing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <TimestampRow
                  label="Created"
                  timestamp={workflow.createdAt}
                />
                <TimestampRow
                  label="Updated"
                  timestamp={workflow.updatedAt}
                />
                {workflow.completedAt !== null ? (
                  <TimestampRow
                    label="Completed"
                    timestamp={workflow.completedAt}
                  />
                ) : null}
              </dl>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MailIcon className="size-4" aria-hidden="true" />
                Mail routing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Sender
                  </dt>
                  <dd className="break-all text-sm/6">
                    {workflow.senderEmail}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Plant head
                  </dt>
                  <dd className="break-all text-sm/6">
                    {workflow.plantHeadEmail}
                  </dd>
                </div>
              </dl>
              <Separator />
              <div className="space-y-3">
                <h2 className="font-heading text-base font-semibold tracking-tight">
                  Resolved vendor mapping
                </h2>
                <ResolvedVendorList
                  resolvedVendorEmails={workflow.resolvedVendorEmails}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export type WorkflowDetailPageProps = Readonly<{
  workflowId: string
}>

export function WorkflowDetailPage({
  workflowId,
}: WorkflowDetailPageProps) {
  const workflowQuery = useWorkflow(workflowId)

  if (workflowQuery.isPending) {
    return <WorkflowDetailSkeleton />
  }

  if (
    workflowQuery.error instanceof ApiError &&
    workflowQuery.error.status === 404
  ) {
    return (
      <section className="mx-auto max-w-2xl space-y-5 border bg-card p-6 sm:p-8">
        <p className="text-xs text-muted-foreground">404</p>
        <h1 className="font-heading text-page-title font-semibold">
          Workflow not found
        </h1>
        <p className="text-base/7 text-muted-foreground">
          No workflow exists for{' '}
          <span className="break-all font-mono">{workflowId}</span>.
        </p>
        <Button asChild className="min-h-11">
          <Link to="/">Start another workflow</Link>
        </Button>
      </section>
    )
  }

  if (workflowQuery.isError) {
    const error =
      workflowQuery.error instanceof Error
        ? workflowQuery.error
        : new Error('The workflow could not be loaded.')
    const canRetry = isTransientApiError(error)

    return (
      <section className="mx-auto max-w-2xl space-y-4">
        <ApiErrorAlert error={error} title="Unable to load workflow" />
        {canRetry ? (
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => void workflowQuery.refetch()}
          >
            <RefreshCwIcon aria-hidden="true" />
            Retry
          </Button>
        ) : null}
        <Button asChild variant="ghost" className="min-h-11">
          <Link to="/">Start another workflow</Link>
        </Button>
      </section>
    )
  }

  return <WorkflowDetail workflow={workflowQuery.data} />
}
