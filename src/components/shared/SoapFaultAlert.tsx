import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'
import type { SoapFault } from '@/lib/soap/fault-parser'
import { XmlHighlighter } from '@/components/shared/XmlHighlighter'

interface SoapFaultAlertProps {
  fault: SoapFault
}

export function SoapFaultAlert({ fault }: SoapFaultAlertProps) {
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <div className="rounded-xl border border-[var(--destructive)]/20 bg-[var(--destructive)]/5 px-4 py-3 space-y-2">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-[var(--destructive)] shrink-0 mt-0.5" />
        <div className="space-y-1.5 min-w-0">
          <p className="text-sm font-semibold text-[var(--destructive)]">SOAP Fault</p>
          <div className="space-y-1 text-xs">
            <FaultField label="Code" value={fault.code} />
            <FaultField label="Message" value={fault.string} />
            {fault.actor && <FaultField label="Actor" value={fault.actor} />}
            {fault.node && <FaultField label="Node" value={fault.node} />}
          </div>
        </div>
      </div>

      {fault.detail && (
        <div className="ml-7">
          <button
            onClick={() => setDetailOpen(!detailOpen)}
            className="flex items-center gap-1 text-xs font-medium text-[var(--destructive)]/70 hover:text-[var(--destructive)] transition-colors"
          >
            {detailOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            Detail
          </button>
          {detailOpen && (
            <XmlHighlighter xml={fault.detail} className="mt-1.5 !text-xs" />
          )}
        </div>
      )}
    </div>
  )
}

function FaultField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-medium text-[var(--destructive)]/70 shrink-0">{label}:</span>
      <span className="text-[var(--foreground)] break-all">{value}</span>
    </div>
  )
}
