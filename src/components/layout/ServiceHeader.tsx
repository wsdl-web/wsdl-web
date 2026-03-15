import type { WsdlDocument } from '@/lib/wsdl/types'
import { useWsdlStore } from '@/store/wsdl-store'
import { Globe } from 'lucide-react'

interface ServiceHeaderProps {
  document: WsdlDocument
}

export function ServiceHeader({ document: doc }: ServiceHeaderProps) {
  const { baseUrlOverride, setBaseUrlOverride } = useWsdlStore()
  const serviceName = doc.services[0]?.name ?? doc.name ?? 'WSDL Service'

  const endpointAddresses = Array.from(
    new Set(doc.services.flatMap((s) => s.endpoints.map((e) => e.address)))
  )

  const defaultOrigin = (() => {
    try { return new URL(endpointAddresses[0]).origin }
    catch { return endpointAddresses[0] ?? '' }
  })()

  return (
    <div className="pt-8 pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              {serviceName}
            </h1>
            <span className="rounded-full bg-[var(--primary)]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--primary)]">
              WSDL {doc.version}
            </span>
          </div>
          {doc.targetNamespace && (
            <p className="mt-1 font-mono text-xs text-[var(--muted-foreground)]">
              {doc.targetNamespace}
            </p>
          )}
          {doc.services[0]?.documentation && (
            <p className="mt-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
              {doc.services[0].documentation}
            </p>
          )}
          {doc.services.length > 1 && (
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {doc.services.length} services &middot; {doc.services.reduce((acc, s) => acc + s.endpoints.length, 0)} endpoints
            </p>
          )}
        </div>
      </div>

      {/* Base URL override */}
      <div className="mt-5 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 card-shadow">
        <Globe className="h-4 w-4 text-[var(--muted-foreground)] shrink-0" />
        <label className="text-xs font-semibold text-[var(--muted-foreground)] shrink-0">
          Base URL
        </label>
        <input
          value={baseUrlOverride}
          onChange={(e) => setBaseUrlOverride(e.target.value)}
          placeholder={defaultOrigin || 'https://...'}
          className="flex-1 bg-transparent font-mono text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/40 focus:outline-none"
        />
        {defaultOrigin && !baseUrlOverride && (
          <span className="text-[11px] text-[var(--muted-foreground)] shrink-0 hidden sm:block">
            default: {defaultOrigin}
          </span>
        )}
      </div>
    </div>
  )
}
