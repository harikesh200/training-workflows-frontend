import {
  FileCheck2Icon,
  RefreshCwIcon,
  Trash2Icon,
  UploadCloudIcon,
} from 'lucide-react'
import { useRef, useState, type DragEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KiB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`
}

export type WorkflowFileInputProps = Readonly<{
  id: string
  label: string
  description: string
  expectedType: string
  accept: string
  value: File | undefined
  error: string | undefined
  onChange: (file: File | undefined) => void
  onBlur: () => void
}>

export function WorkflowFileInput({
  id,
  label,
  description,
  expectedType,
  accept,
  value,
  error,
  onChange,
  onBlur,
}: WorkflowFileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`

  function openFilePicker(): void {
    if (inputRef.current !== null) {
      inputRef.current.value = ''
      inputRef.current.click()
    }
  }

  function removeFile(): void {
    if (inputRef.current !== null) {
      inputRef.current.value = ''
    }
    onChange(undefined)
    onBlur()
  }

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files.item(0)
    onChange(file ?? undefined)
    onBlur()
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {expectedType}
        </span>
      </div>
      <p id={descriptionId} className="text-sm/6 text-muted-foreground">
        {description}
      </p>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        aria-invalid={error !== undefined}
        aria-describedby={
          error === undefined
            ? descriptionId
            : `${descriptionId} ${errorId}`
        }
        onBlur={onBlur}
        onChange={(event) => {
          onChange(event.currentTarget.files?.item(0) ?? undefined)
          onBlur()
        }}
      />
      <div
        className={cn(
          'min-w-0 border border-dashed p-4 transition-colors motion-reduce:transition-none',
          isDragging && 'border-foreground bg-muted',
          error !== undefined && 'border-destructive',
        )}
        onDragEnter={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {value === undefined ? (
          <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-center">
            <span className="flex size-10 shrink-0 items-center justify-center bg-muted text-muted-foreground">
              <UploadCloudIcon aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold tracking-tight">
                Drop file here
              </p>
              <p className="text-xs text-muted-foreground">
                or use the file chooser
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full sm:w-auto"
              onClick={openFilePicker}
            >
              Choose file
            </Button>
          </div>
        ) : (
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <FileCheck2Icon
              className="size-5 shrink-0 text-foreground"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="break-all font-mono text-xs font-medium">
                {value.name}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {formatFileSize(value.size)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 flex-1 sm:flex-none"
                onClick={openFilePicker}
              >
                <RefreshCwIcon aria-hidden="true" />
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="min-h-11 flex-1 sm:flex-none"
                onClick={removeFile}
              >
                <Trash2Icon aria-hidden="true" />
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>
      {error !== undefined ? (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
