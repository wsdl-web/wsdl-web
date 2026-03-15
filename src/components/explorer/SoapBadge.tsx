import type { SoapVersion, BindingStyle } from '@/lib/wsdl/types'

interface SoapBadgeProps {
  soapVersion: SoapVersion
  style: BindingStyle
}

export function SoapBadge({ soapVersion, style }: SoapBadgeProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="rounded-full bg-[var(--soap-badge)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--soap-badge-fg)]">
        SOAP {soapVersion}
      </span>
      <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
        {style}
      </span>
    </div>
  )
}
