import type { SoapVersion } from '../wsdl/types'
import { SOAP_11_CONTENT_TYPE, SOAP_12_CONTENT_TYPE } from './constants'

export interface CurlParams {
  endpointUrl: string
  soapAction: string
  soapVersion: SoapVersion
  body: string
  customHeaders?: Record<string, string>
}

/**
 * Build a cURL command string for a SOAP request.
 */
export function buildCurlCommand(params: CurlParams): string {
  const { endpointUrl, soapAction, soapVersion, body, customHeaders } = params

  const parts: string[] = ['curl']

  if (customHeaders) {
    for (const [name, value] of Object.entries(customHeaders)) {
      parts.push(header(name, value))
    }
  }

  if (soapVersion === '1.1') {
    parts.push(header('Content-Type', SOAP_11_CONTENT_TYPE))
    parts.push(header('SOAPAction', `"${soapAction}"`))
  } else {
    const ct = `${SOAP_12_CONTENT_TYPE}; action="${soapAction}"`
    parts.push(header('Content-Type', ct))
  }

  parts.push(`-d ${shellQuote(body)}`)
  parts.push(shellQuote(endpointUrl))

  return parts.join(' \\\n  ')
}

function header(name: string, value: string): string {
  return `-H ${shellQuote(`${name}: ${value}`)}`
}

function shellQuote(s: string): string {
  return "'" + s.replace(/'/g, "'\\''") + "'"
}