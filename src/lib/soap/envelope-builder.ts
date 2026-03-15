import type { BindingStyle, SoapVersion } from '../wsdl/types'
import { SOAP_11_ENVELOPE_NS, SOAP_12_ENVELOPE_NS } from './constants'

export interface EnvelopeParams {
  soapVersion: SoapVersion
  style: BindingStyle
  operationName: string
  targetNamespace: string
  bodyXml: string
}

/**
 * Build a complete SOAP envelope XML string.
 */
export function buildSoapEnvelope(params: EnvelopeParams): string {
  const { soapVersion, style, operationName, targetNamespace, bodyXml } = params

  const envNs = soapVersion === '1.2' ? SOAP_12_ENVELOPE_NS : SOAP_11_ENVELOPE_NS
  const envPrefix = 'soapenv'

  let bodyContent: string

  if (style === 'rpc') {
    // RPC style: wrap body in operation element with target namespace
    bodyContent = `    <ns:${operationName} xmlns:ns="${targetNamespace}">\n${indentXml(bodyXml, 6)}\n    </ns:${operationName}>`
  } else {
    // Document style: body content goes directly in the Body
    bodyContent = indentXml(bodyXml, 4)
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<${envPrefix}:Envelope xmlns:${envPrefix}="${envNs}">
  <${envPrefix}:Header/>
  <${envPrefix}:Body>
${bodyContent}
  </${envPrefix}:Body>
</${envPrefix}:Envelope>`
}

function indentXml(xml: string, spaces: number): string {
  const pad = ' '.repeat(spaces)
  return xml
    .split('\n')
    .map((line) => (line.trim() ? pad + line : line))
    .join('\n')
}
