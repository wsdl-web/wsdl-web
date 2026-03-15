import type { WsdlDocument, XsdTypeMap } from './types'
import { WSDL_11_NS, WSDL_20_NS, XSD_NS } from '../soap/constants'
import { getChildElements, getFirstChildElement, getAttr } from './xml-helpers'
import { parseXml } from '../xml/parser'
import { parseWsdl1 } from './wsdl1-parser'
import { parseWsdl2 } from './wsdl2-parser'
import { parseSchemaElements } from './xsd-utils'

function parseWsdlDoc(doc: Document): WsdlDocument {
  const ns = doc.documentElement.namespaceURI
  if (ns === WSDL_11_NS) return parseWsdl1(doc)
  if (ns === WSDL_20_NS) return parseWsdl2(doc)
  throw new Error(`Unrecognized WSDL namespace: "${ns}"`)
}

const MAX_DEPTH = 10

interface ResolveContext {
  visited: Set<string>
  fetchFn: (url: string) => Promise<Response>
  depth: number
}

/**
 * Resolve all <wsdl:import>, <wsdl:include>, <xsd:import>, and <xsd:include>
 * elements by fetching referenced documents and merging their contents.
 */
export async function resolveImports(
  doc: WsdlDocument,
  xmlDoc: Document,
  baseUrl: string,
  fetchFn: (url: string) => Promise<Response> = fetch,
): Promise<WsdlDocument> {
  const ctx: ResolveContext = {
    visited: new Set([normalizeUrl(baseUrl)]),
    fetchFn,
    depth: 0,
  }
  return resolveImportsWithContext(doc, xmlDoc, baseUrl, ctx)
}

async function resolveImportsWithContext(
  doc: WsdlDocument,
  xmlDoc: Document,
  baseUrl: string,
  ctx: ResolveContext,
): Promise<WsdlDocument> {
  const root = xmlDoc.documentElement
  const wsdlNs = doc.version === '1.1' ? WSDL_11_NS : WSDL_20_NS

  // Resolve WSDL imports/includes
  const importedWsdls = await resolveWsdlImports(root, wsdlNs, doc.version, baseUrl, ctx)

  // Resolve XSD imports/includes within <types>
  const typesEl = getFirstChildElement(root, wsdlNs, 'types')
  const importedTypes = await resolveXsdImports(typesEl, baseUrl, ctx)

  // Merge everything
  let merged = mergeWsdlDocuments(doc, importedWsdls)
  merged = { ...merged, types: { ...importedTypes, ...merged.types } }
  return merged
}

async function resolveWsdlImports(
  rootEl: Element,
  wsdlNs: string,
  version: string,
  baseUrl: string,
  ctx: ResolveContext,
): Promise<WsdlDocument[]> {
  if (ctx.depth >= MAX_DEPTH) return []

  const results: WsdlDocument[] = []

  // <wsdl:import> (both 1.1 and 2.0)
  const imports = getChildElements(rootEl, wsdlNs, 'import')
  // <wsdl:include> (2.0 only)
  const includes = version === '2.0' ? getChildElements(rootEl, wsdlNs, 'include') : []

  for (const el of [...imports, ...includes]) {
    const location = getAttr(el, 'location')
    if (!location) continue

    const absoluteUrl = resolveUrl(location, baseUrl)
    if (!absoluteUrl) continue

    const normalized = normalizeUrl(absoluteUrl)
    if (ctx.visited.has(normalized)) continue
    ctx.visited.add(normalized)

    try {
      const response = await ctx.fetchFn(absoluteUrl)
      if (!response.ok) continue
      const text = await response.text()
      const xmlDoc = parseXml(text)
      const doc = parseWsdlDoc(xmlDoc)
      const childCtx = { ...ctx, depth: ctx.depth + 1 }
      const resolved = await resolveImportsWithContext(doc, xmlDoc, absoluteUrl, childCtx)
      results.push(resolved)
    } catch {
      // Gracefully skip failed imports
    }
  }

  return results
}

async function resolveXsdImports(
  typesEl: Element | null,
  baseUrl: string,
  ctx: ResolveContext,
): Promise<XsdTypeMap> {
  if (!typesEl || ctx.depth >= MAX_DEPTH) return {}

  const typeMap: XsdTypeMap = {}
  const schemas = getChildElements(typesEl, XSD_NS, 'schema')

  for (const schema of schemas) {
    const imports = getChildElements(schema, XSD_NS, 'import')
    const includes = getChildElements(schema, XSD_NS, 'include')

    for (const el of [...imports, ...includes]) {
      const location = getAttr(el, 'schemaLocation')
      if (!location) continue

      const absoluteUrl = resolveUrl(location, baseUrl)
      if (!absoluteUrl) continue

      const normalized = normalizeUrl(absoluteUrl)
      if (ctx.visited.has(normalized)) continue
      ctx.visited.add(normalized)

      try {
        const response = await ctx.fetchFn(absoluteUrl)
        if (!response.ok) continue
        const text = await response.text()
        const xsdDoc = parseXml(text)
        const xsdRoot = xsdDoc.documentElement

        if (xsdRoot.localName === 'schema' && xsdRoot.namespaceURI === XSD_NS) {
          const tns = getAttr(xsdRoot, 'targetNamespace') ?? ''
          parseSchemaElements(xsdRoot, tns, typeMap)

          // Recursively resolve nested XSD imports
          const nestedTypes = await resolveXsdImportsFromSchema(xsdRoot, absoluteUrl, ctx)
          Object.assign(typeMap, nestedTypes)
        }
      } catch {
        // Gracefully skip failed imports
      }
    }
  }

  return typeMap
}

async function resolveXsdImportsFromSchema(
  schema: Element,
  baseUrl: string,
  ctx: ResolveContext,
): Promise<XsdTypeMap> {
  if (ctx.depth >= MAX_DEPTH) return {}

  const typeMap: XsdTypeMap = {}
  const imports = getChildElements(schema, XSD_NS, 'import')
  const includes = getChildElements(schema, XSD_NS, 'include')

  for (const el of [...imports, ...includes]) {
    const location = getAttr(el, 'schemaLocation')
    if (!location) continue

    const absoluteUrl = resolveUrl(location, baseUrl)
    if (!absoluteUrl) continue

    const normalized = normalizeUrl(absoluteUrl)
    if (ctx.visited.has(normalized)) continue
    ctx.visited.add(normalized)

    try {
      const response = await ctx.fetchFn(absoluteUrl)
      if (!response.ok) continue
      const text = await response.text()
      const xsdDoc = parseXml(text)
      const xsdRoot = xsdDoc.documentElement

      if (xsdRoot.localName === 'schema' && xsdRoot.namespaceURI === XSD_NS) {
        const tns = getAttr(xsdRoot, 'targetNamespace') ?? ''
        parseSchemaElements(xsdRoot, tns, typeMap)
        const nested = await resolveXsdImportsFromSchema(xsdRoot, absoluteUrl, ctx)
        Object.assign(typeMap, nested)
      }
    } catch {
      // Gracefully skip
    }
  }

  return typeMap
}

function mergeWsdlDocuments(root: WsdlDocument, imported: WsdlDocument[]): WsdlDocument {
  if (imported.length === 0) return root

  const serviceNames = new Set(root.services.map((s) => s.name))
  const bindingNames = new Set(root.bindings.map((b) => b.name))
  const interfaceNames = new Set(root.interfaces.map((i) => i.name))
  let mergedTypes: XsdTypeMap = { ...root.types }

  const mergedServices = [...root.services]
  const mergedBindings = [...root.bindings]
  const mergedInterfaces = [...root.interfaces]

  for (const doc of imported) {
    for (const s of doc.services) {
      if (!serviceNames.has(s.name)) {
        mergedServices.push(s)
        serviceNames.add(s.name)
      }
    }
    for (const b of doc.bindings) {
      if (!bindingNames.has(b.name)) {
        mergedBindings.push(b)
        bindingNames.add(b.name)
      }
    }
    for (const i of doc.interfaces) {
      if (!interfaceNames.has(i.name)) {
        mergedInterfaces.push(i)
        interfaceNames.add(i.name)
      }
    }
    // Imported types: root wins on conflicts
    mergedTypes = { ...doc.types, ...mergedTypes }
  }

  return {
    ...root,
    services: mergedServices,
    bindings: mergedBindings,
    interfaces: mergedInterfaces,
    types: mergedTypes,
  }
}

function resolveUrl(location: string, baseUrl: string): string | null {
  try {
    return new URL(location, baseUrl).href
  } catch {
    return null
  }
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url)
    // Strip fragment
    u.hash = ''
    return u.href
  } catch {
    return url
  }
}
