import { useWsdlStore } from '@/store/wsdl-store'
import { TopBar } from '@/components/layout/TopBar'
import { ServiceHeader } from '@/components/layout/ServiceHeader'
import { ServiceList } from '@/components/explorer/ServiceList'
import { ErrorAlert } from '@/components/shared/ErrorAlert'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function App() {
  const { document, operations, isLoading, error } = useWsdlStore()

  return (
    <div className="min-h-screen bg-zinc-50">
      <TopBar />

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner className="h-8 w-8 text-zinc-400" />
          <span className="ml-3 text-zinc-500">Loading WSDL...</span>
        </div>
      )}

      {error && (
        <div className="px-6 py-4">
          <ErrorAlert message={error} />
        </div>
      )}

      {document && !isLoading && (
        <>
          <ServiceHeader document={document} />
          <ServiceList operations={operations} />
        </>
      )}

      {!document && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-32 text-zinc-400">
          <svg
            viewBox="0 0 24 24"
            className="h-16 w-16 mb-4 text-zinc-300"
            fill="currentColor"
          >
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-3 9v2H8v-2h2zm4 0v2h-2v-2h2zm-4 4v2H8v-2h2zm4 0v2h-2v-2h2z" />
          </svg>
          <p className="text-lg">Enter a WSDL URL above to get started</p>
          <p className="text-sm mt-1">Supports WSDL 1.1 and 2.0 with SOAP 1.1/1.2</p>
        </div>
      )}
    </div>
  )
}
