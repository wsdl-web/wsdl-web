import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { ResolvedOperation } from '@/lib/wsdl/types'
import { useWsdlStore } from '@/store/wsdl-store'
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

  // Ensure state exists
  useEffect(() => {
    getOrCreateRequestState(opKey, operation)
  }, [opKey])

  const state = requestStates[opKey]
  if (!state) return null

  const handleExecute = () => {
    executeRequest(opKey, operation)
  }

  const handleCancel = () => {
    setTryItOut(opKey, false)
  }

  return (
    <div className="border-t bg-white px-5 py-4 space-y-4">
      {/* Request metadata */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-zinc-500 w-24">Endpoint:</span>
          <code className="text-xs bg-zinc-100 px-2 py-1 rounded font-mono text-zinc-700 break-all">
            {getEffectiveEndpoint(operation)}
          </code>
        </div>
        {operation.soapAction && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-zinc-500 w-24">SOAPAction:</span>
            <code className="text-xs bg-zinc-100 px-2 py-1 rounded font-mono text-zinc-700 break-all">
              {operation.soapAction}
            </code>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-zinc-500 w-24">Binding:</span>
          <span className="text-xs text-zinc-600">
            SOAP {operation.soapVersion} / {operation.bindingStyle}
          </span>
        </div>
      </div>

      <Separator />

      {/* Parameters / Request section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-zinc-900">Request</h4>
          {!state.tryItOut ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTryItOut(opKey, true)}
            >
              Try it out
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          )}
        </div>

        {state.tryItOut ? (
          <div className="space-y-3">
            <Textarea
              value={state.requestXml}
              onChange={(e) => setRequestXml(opKey, e.target.value)}
              className="font-mono text-xs min-h-[250px] bg-zinc-900 text-zinc-100 border-zinc-700"
              spellCheck={false}
            />
            <Button
              onClick={handleExecute}
              disabled={state.isExecuting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {state.isExecuting ? (
                <>
                  <LoadingSpinner className="h-4 w-4 mr-2" />
                  Executing...
                </>
              ) : (
                'Execute'
              )}
            </Button>
          </div>
        ) : (
          <XmlHighlighter xml={state.requestXml} />
        )}
      </div>

      {/* Response section */}
      {(state.response || state.error) && (
        <>
          <Separator />
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 mb-3">Response</h4>
            {state.error && <ErrorAlert title="Request Failed" message={state.error} />}
            {state.response && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge
                    className={
                      state.response.status >= 200 && state.response.status < 300
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                        : state.response.status >= 400
                          ? 'bg-red-100 text-red-800 hover:bg-red-100'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                    }
                  >
                    {state.response.status} {state.response.statusText}
                  </Badge>
                  <span className="text-xs text-zinc-400">
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
