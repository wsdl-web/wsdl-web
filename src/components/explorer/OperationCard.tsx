import { ChevronDown, ChevronUp } from 'lucide-react'
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
    <div className="border rounded-md overflow-hidden">
      <button
        onClick={() => toggleOperation(opKey)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50 border-l-4 border-l-violet-500 bg-violet-50/50"
      >
        <span className="shrink-0 rounded bg-violet-600 px-2 py-0.5 text-xs font-bold uppercase text-white tracking-wider">
          SOAP
        </span>
        <span className="font-semibold text-zinc-900 flex-1">
          {operation.operationName}
        </span>
        {operation.soapAction && (
          <span className="hidden sm:block text-xs text-zinc-400 font-mono truncate max-w-[300px]">
            {operation.soapAction}
          </span>
        )}
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-zinc-400 shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
        )}
      </button>
      {isExpanded && <OperationDetail operation={operation} opKey={opKey} />}
    </div>
  )
}
