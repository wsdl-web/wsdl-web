import { ChevronDown } from 'lucide-react'
import { useWsdlStore } from '@/store/wsdl-store'

export function WsdlSwitcher() {
  const { wsdlSpecs, activeSpecIndex, switchSpec, isLoading } = useWsdlStore()

  if (wsdlSpecs.length < 2) return null

  return (
    <div className="relative shrink-0">
      <select
        value={activeSpecIndex}
        onChange={(e) => switchSpec(Number(e.target.value))}
        disabled={isLoading}
        className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] py-2.5 pl-3 pr-8 text-sm font-medium text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all disabled:opacity-50 cursor-pointer"
      >
        {wsdlSpecs.map((spec, i) => (
          <option key={i} value={i}>
            {spec.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
    </div>
  )
}
