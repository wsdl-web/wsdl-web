import { useEffect, useRef } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-xml-doc'
import '@/prism-theme.css'

interface XmlHighlighterProps {
  xml: string
  className?: string
}

export function XmlHighlighter({ xml, className = '' }: XmlHighlighterProps) {
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current)
    }
  }, [xml])

  return (
    <pre className={`overflow-auto rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-4 text-sm ${className}`}>
      <code ref={codeRef} className="language-xml">
        {xml}
      </code>
    </pre>
  )
}
