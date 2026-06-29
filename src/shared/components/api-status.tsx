import {
  CircleCheckIcon,
  LoaderCircleIcon,
  WifiOffIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useApiHealth } from '@/features/workflows/hooks/use-api-health'

export function ApiStatus() {
  const healthQuery = useApiHealth()

  if (healthQuery.isPending) {
    return (
      <Badge variant="outline" role="status" className="gap-1.5">
        <LoaderCircleIcon
          className="motion-safe:animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
        Checking API
      </Badge>
    )
  }

  if (healthQuery.isError) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            role="status"
            tabIndex={0}
            className="gap-1.5"
          >
            <WifiOffIcon aria-hidden="true" />
            API unavailable
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          Workflow creation may fail until the API reconnects.
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Badge variant="outline" role="status" className="gap-1.5">
      <CircleCheckIcon aria-hidden="true" />
      API connected
    </Badge>
  )
}
