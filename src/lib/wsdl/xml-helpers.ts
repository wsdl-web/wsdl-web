/**
 * Resolve a QName like "tns:Foo" to { namespace, localName } using the
 * namespace declarations on the given context element.
 */
export function resolveQName(
  qname: string,
  contextNode: Element,
): { namespace: string | null; localName: string } {
  const parts = qname.split(':')
  if (parts.length === 2) {
    const prefix = parts[0]
    const localName = parts[1]
    const namespace = contextNode.lookupNamespaceURI(prefix)
    return { namespace, localName }
  }
  return { namespace: contextNode.lookupNamespaceURI(null), localName: qname }
}

/**
 * Get the local part of a potentially namespace-prefixed name.
 */
export function getLocalPart(name: string): string {
  const idx = name.indexOf(':')
  return idx >= 0 ? name.substring(idx + 1) : name
}

/**
 * Get direct child elements matching a namespace and local name.
 */
export function getChildElements(
  parent: Element,
  namespace: string,
  localName: string,
): Element[] {
  const result: Element[] = []
  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i]
    if (child.namespaceURI === namespace && child.localName === localName) {
      result.push(child)
    }
  }
  return result
}

/**
 * Get the first direct child element matching namespace and local name.
 */
export function getFirstChildElement(
  parent: Element,
  namespace: string,
  localName: string,
): Element | null {
  const children = getChildElements(parent, namespace, localName)
  return children.length > 0 ? children[0] : null
}

/**
 * Get the text content of the first <documentation> child element.
 */
export function getDocumentation(
  parent: Element,
  namespace: string,
): string | undefined {
  const docEl = getFirstChildElement(parent, namespace, 'documentation')
  const text = docEl?.textContent?.trim()
  return text || undefined
}

/**
 * Get attribute value or undefined.
 */
export function getAttr(el: Element, name: string): string | undefined {
  return el.hasAttribute(name) ? el.getAttribute(name)! : undefined
}

/**
 * Get a namespace-qualified attribute value or undefined.
 */
export function getAttrNS(el: Element, namespace: string, localName: string): string | undefined {
  return el.hasAttributeNS(namespace, localName) ? el.getAttributeNS(namespace, localName)! : undefined
}
