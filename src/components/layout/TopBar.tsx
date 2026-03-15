import { useRef, useState } from 'react'
import { FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    // Reset so the same file can be re-selected
    e.target.value = ''
  }

  return (
    <div className="sticky top-0 z-50 flex items-center gap-3 bg-zinc-800 px-4 py-3 shadow-md">
      <div className="flex items-center gap-2 shrink-0">
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 text-emerald-400"
          fill="currentColor"
        >
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-3 9v2H8v-2h2zm4 0v2h-2v-2h2zm-4 4v2H8v-2h2zm4 0v2h-2v-2h2z" />
        </svg>
        <span className="text-lg font-semibold text-white tracking-tight">WSDL Web UI</span>
      </div>
      <Input
        value={inputUrl}
        onChange={(e) => setInputUrl(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter a WSDL URL..."
        className="flex-1 bg-white text-zinc-900 border-0 focus-visible:ring-2 focus-visible:ring-emerald-400"
        disabled={isLoading}
      />
      <Button
        onClick={handleExplore}
        disabled={isLoading || !inputUrl.trim()}
        className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 shrink-0"
      >
        {isLoading ? <LoadingSpinner className="h-4 w-4" /> : 'Explore'}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".wsdl,.xml"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200 border-zinc-600 shrink-0"
        title="Browse for a local WSDL file"
      >
        <FolderOpen className="h-4 w-4 mr-1.5" />
        Browse
      </Button>
    </div>
  )
}
