import { useWsdlStore } from '@/store/wsdl-store'
import { useDeepLink } from '@/hooks/use-deep-link'
import { TopBar } from '@/components/layout/TopBar'
import { ServiceHeader } from '@/components/layout/ServiceHeader'
import { ServiceList } from '@/components/explorer/ServiceList'
import { ErrorAlert } from '@/components/shared/ErrorAlert'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function App() {
  useDeepLink()
  const { document, operations, isLoading, error } = useWsdlStore()

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <TopBar />

      <main className="mx-auto max-w-4xl px-5 pb-16">
        {isLoading && (
          <div className="flex items-center justify-center py-28 animate-fade-up">
            <div className="flex items-center gap-3">
              <LoadingSpinner className="h-5 w-5 text-[var(--primary)]" />
              <span className="text-sm text-[var(--muted-foreground)]">Loading WSDL...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="pt-8 animate-fade-up">
            <ErrorAlert message={error} />
          </div>
        )}

        {document && !isLoading && (
          <div className="animate-fade-up">
            <ServiceHeader document={document} />
            <ServiceList operations={operations} />
          </div>
        )}

        {!document && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-up">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-[var(--primary)]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="12" x2="12" y2="18" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">
              Explore a WSDL service
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)] text-center max-w-sm">
              Enter a URL or browse a local file to inspect services, operations, and send requests.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {['WSDL 1.1', 'WSDL 2.0', 'SOAP 1.1', 'SOAP 1.2', 'Document', 'RPC'].map((tag) => (
                <span key={tag} className="rounded-full bg-[var(--secondary)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
