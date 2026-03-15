import { ChevronRight } from 'lucide-react'
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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden card-shadow card-shadow-hover">
      <button
        onClick={() => toggleGroup(groupKey)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--muted)]"
      >
        <ChevronRight
          className={`h-4 w-4 text-[var(--muted-foreground)] shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
        />
        <h3 className="text-sm font-semibold text-[var(--foreground)] flex-1">{label}</h3>
        {firstOp && (
          <SoapBadge soapVersion={firstOp.soapVersion} style={firstOp.bindingStyle} />
        )}
        <span className="text-xs text-[var(--muted-foreground)]">
          {operations.length} {operations.length === 1 ? 'operation' : 'operations'}
        </span>
      </button>
      {isExpanded && (
        <div className="border-t border-[var(--border)] divide-y divide-[var(--border)] animate-slide-down stagger-children">
          {operations.map((op) => (
            <OperationCard key={`${op.endpointName}/${op.operationName}`} operation={op} />
          ))}
        </div>
      )}
    </div>
  )
}
