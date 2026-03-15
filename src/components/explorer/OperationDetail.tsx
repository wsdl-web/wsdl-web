import { useEffect, useState } from 'react'
import { Play, X, Copy, Check } from 'lucide-react'
import type { ResolvedOperation } from '@/lib/wsdl/types'
import { useWsdlStore } from '@/store/wsdl-store'
import { buildCurlCommand } from '@/lib/soap/curl-builder'
import { XmlHighlighter } from '@/components/shared/XmlHighlighter'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorAlert } from '@/components/shared/ErrorAlert'

interface OperationDetailProps {
  operation: ResolvedOperation
  opKey: string
}

export function OperationDetail({ operation, opKey }: OperationDetailProps) {
  const {
    requestStates,
    getOrCreateRequestState,
    setTryItOut,
    setRequestXml,
    executeRequest,
    getEffectiveEndpoint,
  } = useWsdlStore()

  useEffect(() => {
    getOrCreateRequestState(opKey, operation)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the operation key changes
  }, [opKey])

  const state = requestStates[opKey]
  if (!state) return null

  const [curlCopied, setCurlCopied] = useState(false)

  const handleExecute = () => executeRequest(opKey, operation)
  const handleCancel = () => setTryItOut(opKey, false)

  const handleCopyCurl = () => {
    const curl = buildCurlCommand({
      endpointUrl: getEffectiveEndpoint(operation),
      soapAction: operation.soapAction,
      soapVersion: operation.soapVersion,
      body: state.requestXml,
    })
    navigator.clipboard.writeText(curl).then(() => {
      setCurlCopied(true)
      setTimeout(() => setCurlCopied(false), 2000)
    })
  }

  return (
    <div className="border-t border-[var(--soap-row-border)] bg-[var(--soap-row-bg)] px-5 py-5 space-y-5 animate-slide-down">
      {/* Metadata */}
      <div className="space-y-2.5">
        <MetaRow label="Endpoint" value={getEffectiveEndpoint(operation)} mono />
        {operation.soapAction && (
          <MetaRow label="SOAPAction" value={operation.soapAction} mono />
        )}
        <MetaRow label="Binding" value={`SOAP ${operation.soapVersion} / ${operation.bindingStyle}`} />
      </div>

      <div className="h-px bg-[var(--border)]" />

      {/* Request */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Request
          </h4>
          {!state.tryItOut ? (
            <button
              onClick={() => setTryItOut(opKey, true)}
              className="rounded-lg border border-[var(--primary)]/25 bg-[var(--primary)]/5 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10"
            >
              Try it out
            </button>
          ) : (
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--secondary)]"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
          )}
        </div>

        {state.tryItOut ? (
          <div className="space-y-3">
            <textarea
              value={state.requestXml}
              onChange={(e) => setRequestXml(opKey, e.target.value)}
              spellCheck={false}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--code-bg)] p-4 font-mono text-xs text-[var(--code-fg)] min-h-[240px] focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 resize-y leading-relaxed"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleExecute}
                disabled={state.isExecuting}
                className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
              >
                {state.isExecuting ? (
                  <>
                    <LoadingSpinner className="h-4 w-4" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    Execute
                  </>
                )}
              </button>
              <CopyCurlButton copied={curlCopied} onClick={handleCopyCurl} />
            </div>
          </div>
        ) : (
          <XmlHighlighter xml={state.requestXml} />
        )}
      </div>

      {/* Response */}
      {(state.response || state.error) && (
        <>
          <div className="h-px bg-[var(--border)]" />
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-3">
              Response
            </h4>
            {state.error && <ErrorAlert title="Request Failed" message={state.error} />}
            {state.response && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      state.response.status >= 200 && state.response.status < 300
                        ? 'bg-[var(--success)]/10 text-[var(--success)]'
                        : state.response.status >= 400
                          ? 'bg-[var(--destructive)]/10 text-[var(--destructive)]'
                          : 'bg-[var(--warning)]/10 text-[var(--warning)]'
                    }`}
                  >
                    {state.response.status} {state.response.statusText}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {state.response.durationMs}ms
                  </span>
                </div>
                <XmlHighlighter xml={state.response.body} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function CopyCurlButton({ copied, onClick }: { copied: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2.5 text-xs font-medium text-[var(--secondary-foreground)] transition-colors hover:bg-[var(--secondary)]"
      title="Copy as cURL"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-[var(--success)]" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          cURL
        </>
      )}
    </button>
  )
}

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-3 text-sm">
      <span className="text-xs font-medium text-[var(--muted-foreground)] w-20 shrink-0">{label}</span>
      <span className={`text-xs text-[var(--foreground)] break-all ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  )
}
