import { Plus, X, FileKey } from 'lucide-react'
import { useWsdlStore } from '@/store/wsdl-store'

export function HeadersPanel() {
  const {
    customHeaders,
    addCustomHeader,
    updateCustomHeader,
    toggleCustomHeader,
    removeCustomHeader,
  } = useWsdlStore()

  const enabledCount = customHeaders.filter((h) => h.enabled && h.key.trim()).length

  return (
    <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--card)] card-shadow">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <FileKey className="h-4 w-4 text-[var(--muted-foreground)] shrink-0" />
          <span className="text-xs font-semibold text-[var(--muted-foreground)]">
            Custom Headers
          </span>
          {enabledCount > 0 && (
            <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--primary)]">
              {enabledCount}
            </span>
          )}
        </div>
        <button
          onClick={addCustomHeader}
          className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--secondary)]"
          title="Add header"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>
      {customHeaders.length > 0 && (
        <div className="border-t border-[var(--border)] px-4 py-3 space-y-2">
          {customHeaders.map((h) => (
            <div key={h.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={h.enabled}
                onChange={() => toggleCustomHeader(h.id)}
                className="h-3.5 w-3.5 shrink-0 accent-[var(--primary)]"
              />
              <input
                value={h.key}
                onChange={(e) => updateCustomHeader(h.id, 'key', e.target.value)}
                placeholder="Header name"
                className="flex-1 min-w-0 bg-transparent font-mono text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/40 focus:outline-none border-b border-transparent focus:border-[var(--primary)]/30 py-1"
              />
              <input
                value={h.value}
                onChange={(e) => updateCustomHeader(h.id, 'value', e.target.value)}
                placeholder="Value"
                className="flex-1 min-w-0 bg-transparent font-mono text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/40 focus:outline-none border-b border-transparent focus:border-[var(--primary)]/30 py-1"
              />
              <button
                onClick={() => removeCustomHeader(h.id)}
                className="shrink-0 rounded p-1 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)]"
                title="Remove header"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
