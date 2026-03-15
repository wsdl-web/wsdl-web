import { ChevronRight } from 'lucide-react'
import type { ResolvedOperation } from '@/lib/wsdl/types'
import { useWsdlStore, buildOperationKey } from '@/store/wsdl-store'
import { OperationDetail } from './OperationDetail'

interface OperationCardProps {
  operation: ResolvedOperation
}

export function OperationCard({ operation }: OperationCardProps) {
  const { expandedOperations, toggleOperation } = useWsdlStore()
  const opKey = buildOperationKey(operation)
  const isExpanded = expandedOperations.has(opKey)

  return (
    <div>
      <button
        onClick={() => toggleOperation(opKey)}
        className={`flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[var(--soap-row-bg)] ${isExpanded ? 'bg-[var(--soap-row-bg)]' : ''}`}
      >
        <span className="shrink-0 rounded-md bg-[var(--soap-badge)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--soap-badge-fg)]">
          SOAP
        </span>
        <span className="text-sm font-medium text-[var(--foreground)] flex-1">
          {operation.operationName}
        </span>
        {operation.soapAction && (
          <span className="hidden md:block font-mono text-[11px] text-[var(--muted-foreground)] truncate max-w-[260px]">
            {operation.soapAction}
          </span>
        )}
        <ChevronRight
          className={`h-3.5 w-3.5 text-[var(--muted-foreground)] shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
        />
      </button>
      {isExpanded && <OperationDetail operation={operation} opKey={opKey} />}
    </div>
  )
}
