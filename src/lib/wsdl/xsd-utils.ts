import type { XsdType, XsdTypeMap, XsdField } from './types'
import { XSD_NS } from '../soap/constants'
import { getChildElements, getAttr } from './xml-helpers'

/**
 * Parse all <xsd:schema> elements found within a WSDL types section.
 */
export function parseXsdTypes(typesElement: Element | null): XsdTypeMap {
  const typeMap: XsdTypeMap = {}
  if (!typesElement) return typeMap

  const schemas = getChildElements(typesElement, XSD_NS, 'schema')
  for (const schema of schemas) {
    const tns = getAttr(schema, 'targetNamespace') ?? ''
    parseSchemaElements(schema, tns, typeMap)
  }
  return typeMap
}

export function parseSchemaElements(schema: Element, tns: string, typeMap: XsdTypeMap): void {
  // Parse top-level elements
  for (const el of getChildElements(schema, XSD_NS, 'element')) {
    const name = getAttr(el, 'name')
    if (!name) continue

    const typeAttr = getAttr(el, 'type')
    const qName = tns ? `{${tns}}${name}` : name

    // Check for inline complexType
    const inlineComplex = getChildElements(el, XSD_NS, 'complexType')[0]
    if (inlineComplex) {
      const fields = parseComplexTypeFields(inlineComplex, schema)
      typeMap[qName] = { name, kind: 'element', fields, elementType: undefined }
      // Also store a plain name version for easier lookup
      typeMap[name] = typeMap[qName]
    } else {
      typeMap[qName] = { name, kind: 'element', fields: [], elementType: typeAttr }
      typeMap[name] = typeMap[qName]
    }
  }

  // Parse named complexTypes
  for (const ct of getChildElements(schema, XSD_NS, 'complexType')) {
    const name = getAttr(ct, 'name')
    if (!name) continue
    const fields = parseComplexTypeFields(ct, schema)
    const qName = tns ? `{${tns}}${name}` : name
    typeMap[qName] = { name, kind: 'complex', fields }
    typeMap[name] = typeMap[qName]
  }

  // Parse named simpleTypes
  for (const st of getChildElements(schema, XSD_NS, 'simpleType')) {
    const name = getAttr(st, 'name')
    if (!name) continue
    const restriction = getChildElements(st, XSD_NS, 'restriction')[0]
    const base = restriction ? getAttr(restriction, 'base') : undefined
    const qName = tns ? `{${tns}}${name}` : name
    typeMap[qName] = {
      name,
      kind: 'simple',
      fields: [],
      restriction: base ? { base } : undefined,
    }
    typeMap[name] = typeMap[qName]
  }
}

function parseComplexTypeFields(ct: Element, schema: Element): XsdField[] {
  // Look for sequence, all, or direct elements
  const sequence = getChildElements(ct, XSD_NS, 'sequence')[0]
  const all = getChildElements(ct, XSD_NS, 'all')[0]
  const container = sequence ?? all

  if (!container) {
    // Maybe it has direct element children
    return parseElementFields(ct, schema)
  }

  return parseElementFields(container, schema)
}

function parseElementFields(container: Element, schema: Element): XsdField[] {
  const fields: XsdField[] = []
  for (const el of getChildElements(container, XSD_NS, 'element')) {
    const name = getAttr(el, 'name') ?? 'unknown'
    const type = getAttr(el, 'type') ?? 'xsd:string'
    const minOccurs = parseInt(getAttr(el, 'minOccurs') ?? '1', 10)
    const maxOccursStr = getAttr(el, 'maxOccurs') ?? '1'
    const maxOccurs = maxOccursStr === 'unbounded' ? 'unbounded' as const : parseInt(maxOccursStr, 10)

    // Check for inline complex type
    const inlineComplex = getChildElements(el, XSD_NS, 'complexType')[0]
    const children = inlineComplex ? parseComplexTypeFields(inlineComplex, schema) : undefined

    fields.push({ name, type, minOccurs, maxOccurs, children })
  }
  return fields
}

/**
 * Generate sample XML for an operation's input message.
 * Uses the XSD type info to produce placeholder values.
 */
export function generateSampleXml(
  elementName: string,
  namespace: string,
  parts: Array<{ name: string; element?: string; type?: string }>,
  typeMap: XsdTypeMap,
  maxDepth = 5,
): string {
  if (parts.length === 0) {
    return `<${elementName} xmlns="${namespace}"/>`
  }

  // For element-based parts (document style), the element IS the body content
  // — no extra wrapper needed. Generate the element directly with its namespace.
  if (parts.length === 1 && parts[0].element) {
    const partElement = parts[0].element
    const typeDef = typeMap[partElement] ?? typeMap[getLocalFromQName(partElement)]
    if (typeDef) {
      const elName = typeDef.name
      if (typeDef.fields.length > 0) {
        let inner = ''
        for (const field of typeDef.fields) {
          inner += generateFieldXml(field, typeMap, 2, maxDepth)
        }
        return `<${elName} xmlns="${namespace}">\n${inner}</${elName}>`
      }
      if (typeDef.elementType) {
        const refType = typeMap[typeDef.elementType] ?? typeMap[getLocalFromQName(typeDef.elementType)]
        if (refType && refType.fields.length > 0) {
          let inner = ''
          for (const field of refType.fields) {
            inner += generateFieldXml(field, typeMap, 2, maxDepth)
          }
          return `<${elName} xmlns="${namespace}">\n${inner}</${elName}>`
        }
      }
      return `<${elName} xmlns="${namespace}">?</${elName}>`
    }
    const localName = getLocalFromQName(partElement)
    return `<${localName} xmlns="${namespace}">?</${localName}>`
  }

  // For type-based parts (RPC style) or multiple parts
  let inner = ''
  for (const part of parts) {
    if (part.type) {
      const typeDef = typeMap[part.type] ?? typeMap[getLocalFromQName(part.type)]
      if (typeDef && typeDef.kind === 'complex') {
        for (const field of typeDef.fields) {
          inner += generateFieldXml(field, typeMap, 2, maxDepth)
        }
      } else {
        inner += `  <${part.name}>${getDefaultValue(part.type)}</${part.name}>\n`
      }
    } else if (part.element) {
      const typeDef = typeMap[part.element] ?? typeMap[getLocalFromQName(part.element)]
      if (typeDef) {
        inner += generateTypeXml(typeDef.name, typeDef, typeMap, 2, maxDepth)
      } else {
        inner += `  <${getLocalFromQName(part.element)}>?</${getLocalFromQName(part.element)}>\n`
      }
    } else {
      inner += `  <${part.name}>?</${part.name}>\n`
    }
  }

  return `<${elementName} xmlns="${namespace}">\n${inner}</${elementName}>`
}

function generateFieldXml(field: XsdField, typeMap: XsdTypeMap, indent: number, maxDepth: number): string {
  const pad = ' '.repeat(indent)
  if (field.children && field.children.length > 0) {
    return generateFieldsXml(field.name, field.children, typeMap, indent, maxDepth - 1)
  }
  const typeDef = typeMap[field.type] ?? typeMap[getLocalFromQName(field.type)]
  if (typeDef && typeDef.kind === 'complex' && typeDef.fields.length > 0) {
    return generateFieldsXml(field.name, typeDef.fields, typeMap, indent, maxDepth - 1)
  }
  return `${pad}<${field.name}>${getDefaultValue(field.type)}</${field.name}>\n`
}

function generateTypeXml(
  elementName: string,
  typeDef: XsdType,
  typeMap: XsdTypeMap,
  indent: number,
  maxDepth: number,
): string {
  const pad = ' '.repeat(indent)
  if (maxDepth <= 0) return `${pad}<${elementName}>...</${elementName}>\n`

  if (typeDef.kind === 'simple' || typeDef.fields.length === 0) {
    if (typeDef.elementType) {
      const refType = typeMap[typeDef.elementType] ?? typeMap[getLocalFromQName(typeDef.elementType)]
      if (refType && refType.fields.length > 0) {
        return generateFieldsXml(elementName, refType.fields, typeMap, indent, maxDepth)
      }
    }
    const val = typeDef.restriction?.base ? getDefaultValue(typeDef.restriction.base) : '?'
    return `${pad}<${elementName}>${val}</${elementName}>\n`
  }

  return generateFieldsXml(elementName, typeDef.fields, typeMap, indent, maxDepth)
}

function generateFieldsXml(
  wrapperName: string,
  fields: XsdField[],
  typeMap: XsdTypeMap,
  indent: number,
  maxDepth: number,
): string {
  const pad = ' '.repeat(indent)
  let result = `${pad}<${wrapperName}>\n`
  for (const field of fields) {
    if (field.children && field.children.length > 0) {
      result += generateFieldsXml(field.name, field.children, typeMap, indent + 2, maxDepth - 1)
    } else {
      const typeDef = typeMap[field.type] ?? typeMap[getLocalFromQName(field.type)]
      if (typeDef && typeDef.kind === 'complex' && typeDef.fields.length > 0) {
        result += generateFieldsXml(field.name, typeDef.fields, typeMap, indent + 2, maxDepth - 1)
      } else {
        const val = getDefaultValue(field.type)
        result += `${pad}  <${field.name}>${val}</${field.name}>\n`
      }
    }
  }
  result += `${pad}</${wrapperName}>\n`
  return result
}

function getLocalFromQName(qname: string): string {
  // Handle {namespace}localName format
  const braceIdx = qname.lastIndexOf('}')
  if (braceIdx >= 0) return qname.substring(braceIdx + 1)
  // Handle prefix:localName format
  const colonIdx = qname.indexOf(':')
  return colonIdx >= 0 ? qname.substring(colonIdx + 1) : qname
}

function getDefaultValue(xsdType: string): string {
  const local = getLocalFromQName(xsdType).toLowerCase()
  switch (local) {
    case 'string': return 'string'
    case 'int':
    case 'integer':
    case 'long':
    case 'short':
    case 'byte': return '0'
    case 'float':
    case 'double':
    case 'decimal': return '0.0'
    case 'boolean': return 'false'
    case 'date': return '2024-01-01'
    case 'datetime': return '2024-01-01T00:00:00'
    case 'time': return '00:00:00'
    default: return '?'
  }
}
