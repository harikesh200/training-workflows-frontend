import {
  CheckCircle2Icon,
  CircleDotDashedIcon,
  CircleXIcon,
  LoaderCircleIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import type { WorkflowStatus } from '@/features/workflows/types/workflow.types'
import { cn } from '@/lib/utils'

const statusConfig = {
  queued: {
    label: 'Queued',
    Icon: CircleDotDashedIcon,
    className: 'bg-muted text-foreground',
  },
  running: {
    label: 'Running',
    Icon: LoaderCircleIcon,
    className: 'bg-secondary text-secondary-foreground',
  },
  succeeded: {
    label: 'Succeeded',
    Icon: CheckCircle2Icon,
    className: 'bg-primary text-primary-foreground',
  },
  failed: {
    label: 'Failed',
    Icon: CircleXIcon,
    className: 'bg-destructive/10 text-destructive',
  },
} as const

export type WorkflowStatusBadgeProps = Readonly<{
  status: WorkflowStatus
}>

export function WorkflowStatusBadge({
  status,
}: WorkflowStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.Icon

  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5', config.className)}
    >
      <Icon
        className={cn(
          status === 'running' &&
            'motion-safe:animate-spin motion-reduce:animate-none',
        )}
        aria-hidden="true"
      />
      {config.label}
    </Badge>
  )
}
