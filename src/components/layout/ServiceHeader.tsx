import type { WsdlDocument } from '@/lib/wsdl/types'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useWsdlStore } from '@/store/wsdl-store'

interface ServiceHeaderProps {
  document: WsdlDocument
}

export function ServiceHeader({ document: doc }: ServiceHeaderProps) {
  const { baseUrlOverride, setBaseUrlOverride } = useWsdlStore()
  const serviceName = doc.services[0]?.name ?? doc.name ?? 'WSDL Service'

  // Collect unique endpoint addresses from the WSDL
  const endpointAddresses = Array.from(
    new Set(doc.services.flatMap((s) => s.endpoints.map((e) => e.address)))
  )

  return (
    <div className="border-b bg-white px-6 py-6">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold text-zinc-900">{serviceName}</h1>
        <Badge variant="outline" className="text-xs">
          WSDL {doc.version}
        </Badge>
      </div>
      {doc.targetNamespace && (
        <p className="mt-1 text-sm text-zinc-500 font-mono">{doc.targetNamespace}</p>
      )}
      {doc.services.length > 1 && (
        <p className="mt-2 text-sm text-zinc-600">
          {doc.services.length} services, {doc.services.reduce((acc, s) => acc + s.endpoints.length, 0)} endpoints
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm font-semibold text-zinc-700 shrink-0">Base URL</label>
        <Input
          value={baseUrlOverride}
          onChange={(e) => setBaseUrlOverride(e.target.value)}
          placeholder={endpointAddresses[0] ? new URL(endpointAddresses[0]).origin : 'https://...'}
          className="max-w-md text-sm font-mono"
        />
        {endpointAddresses.length > 0 && (
          <span className="text-xs text-zinc-400 truncate hidden sm:block">
            WSDL default: {(() => { try { return new URL(endpointAddresses[0]).origin } catch { return endpointAddresses[0] } })()}
          </span>
        )}
      </div>
    </div>
  )
}
