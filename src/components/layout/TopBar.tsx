import { useRef, useState } from 'react'
import { FolderOpen, Search, ArrowRight } from 'lucide-react'
import { useWsdlStore } from '@/store/wsdl-store'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export function TopBar() {
  const { wsdlUrl, loadWsdl, loadWsdlFromText, isLoading } = useWsdlStore()
  const [inputUrl, setInputUrl] = useState(wsdlUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExplore = () => {
    const url = inputUrl.trim()
    if (!url) return
    loadWsdl(url)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleExplore()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      setInputUrl(file.name)
      loadWsdlFromText(text, file.name)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-5 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0 mr-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]">
            <svg viewBox="0 0 16 16" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 2h5l4 4v7a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" />
              <polyline points="9 2 9 6 13 6" />
            </svg>
          </div>
          <span className="hidden sm:block text-sm font-bold text-[var(--foreground)]">
            WSDL Web UI
          </span>
        </div>

        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste a WSDL URL..."
            disabled={isLoading}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all disabled:opacity-50"
          />
        </div>

        {/* Explore */}
        <button
          onClick={handleExplore}
          disabled={isLoading || !inputUrl.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none shrink-0"
        >
          {isLoading ? (
            <LoadingSpinner className="h-4 w-4" />
          ) : (
            <>
              Explore
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-[var(--border)] shrink-0" />

        {/* Browse */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".wsdl,.xml"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm font-medium text-[var(--secondary-foreground)] transition-all hover:bg-[var(--secondary)] active:scale-[0.97] disabled:opacity-40 shrink-0"
          title="Browse for a local WSDL file"
        >
          <FolderOpen className="h-4 w-4 text-[var(--muted-foreground)]" />
          <span className="hidden sm:block">Browse</span>
        </button>
      </div>
    </header>
  )
}
