import { parseXml } from '@/lib/xml/parser'
import { SOAP_11_ENVELOPE_NS, SOAP_12_ENVELOPE_NS } from '@/lib/soap/constants'

export interface SoapFault {
  code: string
  string: string
  actor?: string
  node?: string
  detail?: string
}

/**
 * Attempts to detect and parse a SOAP Fault from a response XML string.
 * Supports both SOAP 1.1 and 1.2 fault structures.
 * Returns null if the response is not a fault or cannot be parsed.
 */
export function parseSoapFault(responseXml: string): SoapFault | null {
  let doc: Document
  try {
    doc = parseXml(responseXml)
  } catch {
    return null
  }

  // Try SOAP 1.1 first, then 1.2
  const fault = parseSoap11Fault(doc) ?? parseSoap12Fault(doc)
  return fault
}

function parseSoap11Fault(doc: Document): SoapFault | null {
  const fault = doc.getElementsByTagNameNS(SOAP_11_ENVELOPE_NS, 'Fault')[0]
  if (!fault) return null

  const code = getChildText(fault, 'faultcode')
  const string = getChildText(fault, 'faultstring')
  if (!code || !string) return null

  const result: SoapFault = { code, string }

  const actor = getChildText(fault, 'faultactor')
  if (actor) result.actor = actor

  const detail = getChildElement(fault, 'detail')
  if (detail) result.detail = serializeChildren(detail)

  return result
}

function parseSoap12Fault(doc: Document): SoapFault | null {
  const fault = doc.getElementsByTagNameNS(SOAP_12_ENVELOPE_NS, 'Fault')[0]
  if (!fault) return null

  const codeEl = getChildElementNS(fault, SOAP_12_ENVELOPE_NS, 'Code')
  const reasonEl = getChildElementNS(fault, SOAP_12_ENVELOPE_NS, 'Reason')
  if (!codeEl || !reasonEl) return null

  const code = getChildTextNS(codeEl, SOAP_12_ENVELOPE_NS, 'Value')
  const string = getChildTextNS(reasonEl, SOAP_12_ENVELOPE_NS, 'Text')
  if (!code || !string) return null

  const result: SoapFault = { code, string }

  const roleEl = getChildElementNS(fault, SOAP_12_ENVELOPE_NS, 'Role')
  if (roleEl?.textContent) result.actor = roleEl.textContent.trim()

  const nodeEl = getChildElementNS(fault, SOAP_12_ENVELOPE_NS, 'Node')
  if (nodeEl?.textContent) result.node = nodeEl.textContent.trim()

  const detailEl = getChildElementNS(fault, SOAP_12_ENVELOPE_NS, 'Detail')
  if (detailEl) result.detail = serializeChildren(detailEl)

  return result
}

/** Get text content of a direct child element by local name (no namespace). */
function getChildText(parent: Element, localName: string): string | null {
  const el = getChildElement(parent, localName)
  return el?.textContent?.trim() ?? null
}

/** Get a direct child element by local name (no namespace). */
function getChildElement(parent: Element, localName: string): Element | null {
  for (let i = 0; i < parent.children.length; i++) {
    if (parent.children[i].localName === localName) {
      return parent.children[i]
    }
  }
  return null
}

/** Get a direct child element by namespace and local name. */
function getChildElementNS(parent: Element, ns: string, localName: string): Element | null {
  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i]
    if (child.localName === localName && child.namespaceURI === ns) {
      return child
    }
  }
  return null
}

/** Get text content of a direct child element by namespace and local name. */
function getChildTextNS(parent: Element, ns: string, localName: string): string | null {
  const el = getChildElementNS(parent, ns, localName)
  return el?.textContent?.trim() ?? null
}

/** Serialize all child nodes of an element to an XML string. */
function serializeChildren(el: Element): string {
  const serializer = new XMLSerializer()
  let result = ''
  for (let i = 0; i < el.childNodes.length; i++) {
    result += serializer.serializeToString(el.childNodes[i])
  }
  return result.trim()
}
