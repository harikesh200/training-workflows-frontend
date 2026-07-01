import type { PublicWorkflow } from '@/features/workflows/types/workflow.types'

type QueuedWorkflow = Extract<PublicWorkflow, { status: 'queued' }>
type RunningWorkflow = Extract<PublicWorkflow, { status: 'running' }>
type SucceededWorkflow = Extract<
  PublicWorkflow,
  { status: 'succeeded' }
>
type FailedWorkflow = Extract<PublicWorkflow, { status: 'failed' }>

const baseWorkflow = {
  id: 'wf_test-123',
  senderEmail: 'sender@example.com',
  vendorEmailList: ['vendor@example.com'],
  resolvedVendorEmails: {},
  plantHeadEmail: 'plant@example.com',
  createdAt: '2026-06-29T10:00:00.000Z',
  updatedAt: '2026-06-29T10:00:01.000Z',
}

export function makeQueuedWorkflow(
  overrides: Partial<QueuedWorkflow> = {},
): QueuedWorkflow {
  return {
    ...baseWorkflow,
    status: 'queued',
    currentStep: 'queued',
    progress: 0,
    error: null,
    completedAt: null,
    ...overrides,
  }
}

export function makeRunningWorkflow(
  overrides: Partial<RunningWorkflow> = {},
): RunningWorkflow {
  return {
    ...baseWorkflow,
    status: 'running',
    currentStep: 'log_analysis',
    progress: 20,
    error: null,
    completedAt: null,
    ...overrides,
  }
}

export function makeSucceededWorkflow(
  overrides: Partial<SucceededWorkflow> = {},
): SucceededWorkflow {
  return {
    ...baseWorkflow,
    status: 'succeeded',
    currentStep: 'completed',
    progress: 100,
    error: null,
    completedAt: '2026-06-29T10:03:00.000Z',
    resolvedVendorEmails: {
      'Acme Parts': 'vendor@example.com',
    },
    ...overrides,
  }
}

export function makeFailedWorkflow(
  overrides: Partial<FailedWorkflow> = {},
): FailedWorkflow {
  return {
    ...baseWorkflow,
    status: 'failed',
    currentStep: 'failed',
    progress: 45,
    error: 'Purchase-order generation failed.',
    completedAt: '2026-06-29T10:02:00.000Z',
    ...overrides,
  }
}
