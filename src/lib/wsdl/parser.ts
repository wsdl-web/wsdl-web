import type { WsdlDocument, ResolvedOperation } from './types'
import { WSDL_11_NS, WSDL_20_NS } from '../soap/constants'
import { parseXml } from '../xml/parser'
import { parseWsdl1 } from './wsdl1-parser'
import { parseWsdl2 } from './wsdl2-parser'

export class WsdlParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WsdlParseError'
  }
}

/**
 * Fetch a WSDL document from a URL and parse it.
 */
export async function fetchAndParseWsdl(url: string): Promise<WsdlDocument> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new WsdlParseError(`Failed to fetch WSDL: ${response.status} ${response.statusText}`)
  }
  const text = await response.text()
  return parseWsdlText(text)
}

/**
 * Parse WSDL from a text string. Detects version automatically.
 */
export function parseWsdlText(text: string): WsdlDocument {
  const doc = parseXml(text)
  return parseWsdlDocument(doc)
}

/**
 * Parse a WSDL DOM document. Detects version from root namespace.
 */
export function parseWsdlDocument(doc: Document): WsdlDocument {
  const root = doc.documentElement
  const ns = root.namespaceURI

  if (ns === WSDL_11_NS) {
    return parseWsdl1(doc)
  } else if (ns === WSDL_20_NS) {
    return parseWsdl2(doc)
  }

  throw new WsdlParseError(
    `Unrecognized WSDL namespace: "${ns}". Expected WSDL 1.1 or 2.0.`
  )
}

/**
 * Resolve all operations from a parsed WSDL document into a flat list
 * of fully-resolved operations ready for rendering and invocation.
 */
export function resolveOperations(wsdl: WsdlDocument): ResolvedOperation[] {
  const ops: ResolvedOperation[] = []

  for (const service of wsdl.services) {
    for (const endpoint of service.endpoints) {
      const binding = wsdl.bindings.find((b) => b.name === endpoint.bindingRef)
      if (!binding) continue

      const iface = wsdl.interfaces.find((i) => i.name === binding.interfaceRef)
      if (!iface) continue

      for (const bindingOp of binding.operations) {
        const ifaceOp = iface.operations.find((o) => o.name === bindingOp.name)

        ops.push({
          serviceName: service.name,
          endpointName: endpoint.name,
          endpointAddress: endpoint.address,
          bindingName: binding.name,
          bindingStyle: bindingOp.style ?? binding.style,
          soapVersion: binding.soapVersion,
          operationName: bindingOp.name,
          documentation: ifaceOp?.documentation,
          soapAction: bindingOp.soapAction,
          input: ifaceOp?.input ?? null,
          output: ifaceOp?.output ?? null,
          targetNamespace: wsdl.targetNamespace,
        })
      }
    }
  }

  return ops
}
