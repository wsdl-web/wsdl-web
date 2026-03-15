import type { SoapRequest, SoapResponse } from './types'
import { SOAP_11_CONTENT_TYPE, SOAP_12_CONTENT_TYPE } from './constants'

/**
 * Send a SOAP request via fetch().
 */
export async function sendSoapRequest(request: SoapRequest): Promise<SoapResponse> {
  const { endpointUrl, soapAction, soapVersion, envelopeXml } = request

  const headers: Record<string, string> = { ...request.customHeaders }

  if (soapVersion === '1.1') {
    headers['Content-Type'] = SOAP_11_CONTENT_TYPE
    headers['SOAPAction'] = `"${soapAction}"`
  } else {
    // SOAP 1.2: action goes in Content-Type header
    headers['Content-Type'] = `${SOAP_12_CONTENT_TYPE}; action="${soapAction}"`
  }

  const start = performance.now()

  const response = await fetch(endpointUrl, {
    method: 'POST',
    headers,
    body: envelopeXml,
  })

  const durationMs = Math.round(performance.now() - start)
  const body = await response.text()

  const responseHeaders: Record<string, string> = {}
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value
  })

  return {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    body,
    durationMs,
  }
}
