import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ResolvedOperation } from '@/lib/wsdl/types'
import { useWsdlStore } from '@/store/wsdl-store'
import { OperationCard } from './OperationCard'
import { SoapBadge } from './SoapBadge'

interface EndpointGroupProps {
  groupKey: string
  label: string
  operations: ResolvedOperation[]
}

export function EndpointGroup({ groupKey, label, operations }: EndpointGroupProps) {
  const { expandedGroups, toggleGroup } = useWsdlStore()
  const isExpanded = expandedGroups.has(groupKey)
  const firstOp = operations[0]

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => toggleGroup(groupKey)}
        className="flex w-full items-center gap-3 bg-zinc-50 px-5 py-3 text-left hover:bg-zinc-100 transition-colors"
      >
        <h3 className="text-lg font-bold text-zinc-800 flex-1">{label}</h3>
        {firstOp && (
          <SoapBadge soapVersion={firstOp.soapVersion} style={firstOp.bindingStyle} />
        )}
        <span className="text-xs text-zinc-400">{operations.length} operations</span>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-zinc-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-zinc-400" />
        )}
      </button>
      {isExpanded && (
        <div className="space-y-2 p-3 bg-white">
          {operations.map((op) => (
            <OperationCard key={`${op.endpointName}/${op.operationName}`} operation={op} />
          ))}
        </div>
      )}
    </div>
  )
}
