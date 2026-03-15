import type { ResolvedOperation } from '@/lib/wsdl/types'
import { EndpointGroup } from './EndpointGroup'

interface ServiceListProps {
  operations: ResolvedOperation[]
}

export function ServiceList({ operations }: ServiceListProps) {
  // Group operations by service/endpoint
  const groups = new Map<string, { label: string; operations: ResolvedOperation[] }>()

  for (const op of operations) {
    const key = `${op.serviceName}/${op.endpointName}`
    if (!groups.has(key)) {
      groups.set(key, {
        label: op.endpointName,
        operations: [],
      })
    }
    groups.get(key)!.operations.push(op)
  }

  return (
    <div className="space-y-4 px-6 py-4">
      {Array.from(groups.entries()).map(([key, group]) => (
        <EndpointGroup
          key={key}
          groupKey={key}
          label={group.label}
          operations={group.operations}
        />
      ))}
    </div>
  )
}
