import { ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto flex max-w-4xl items-center justify-center gap-1.5 px-5 py-4 text-xs text-[var(--muted-foreground)]">
        <span>&copy;</span>
        <a
          href="https://github.com/wsdl-web"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium transition-colors hover:text-[var(--foreground)]"
        >
          The WSDL Web Project
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </footer>
  )
}
