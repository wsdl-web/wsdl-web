import { AlertCircle } from 'lucide-react'

interface ErrorAlertProps {
  title?: string
  message: string
}

export function ErrorAlert({ title = 'Error', message }: ErrorAlertProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--destructive)]/20 bg-[var(--destructive)]/5 px-4 py-3">
      <AlertCircle className="h-4 w-4 text-[var(--destructive)] shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-[var(--destructive)]">{title}</p>
        <p className="mt-0.5 text-xs text-[var(--destructive)]/70">{message}</p>
      </div>
    </div>
  )
}
