import type {
  WsdlDocument,
  WsdlService,
  WsdlEndpoint,
  WsdlBinding,
  WsdlBindingOperation,
  WsdlInterface,
  WsdlInterfaceOperation,
  WsdlMessage,
  BindingStyle,
  BindingType,
  SoapVersion,
} from './types'
import { WSDL_20_NS } from '../soap/constants'
import { getChildElements, getFirstChildElement, getAttr, getLocalPart, getDocumentation } from './xml-helpers'
import { parseXsdTypes } from './xsd-utils'

// WSDL 2.0 uses a different SOAP binding namespace
const WSDL2_SOAP_NS = 'http://www.w3.org/ns/wsdl/soap'

/**
 * Parse a WSDL 2.0 document.
 */
export function parseWsdl2(doc: Document): WsdlDocument {
  const root = doc.documentElement
  const targetNamespace = getAttr(root, 'targetNamespace') ?? ''
  const name = getAttr(root, 'name')

  // Parse types
  const typesEl = getFirstChildElement(root, WSDL_20_NS, 'types')
  const types = parseXsdTypes(typesEl)

  // Parse interfaces (WSDL 2.0 has no separate message elements)
  const interfaces = parseInterfaces(root)

  // Parse bindings
  const bindings = parseBindings(root)

  // Parse services
  const services = parseServices(root)

  return {
    version: '2.0',
    targetNamespace,
    name,
    services,
    bindings,
    interfaces,
    types,
  }
}

function parseInterfaces(root: Element): WsdlInterface[] {
  const interfaces: WsdlInterface[] = []

  for (const ifEl of getChildElements(root, WSDL_20_NS, 'interface')) {
    const name = getAttr(ifEl, 'name')
    if (!name) continue

    const operations: WsdlInterfaceOperation[] = []
    for (const opEl of getChildElements(ifEl, WSDL_20_NS, 'operation')) {
      const opName = getAttr(opEl, 'name')
      if (!opName) continue

      const inputEl = getFirstChildElement(opEl, WSDL_20_NS, 'input')
      const outputEl = getFirstChildElement(opEl, WSDL_20_NS, 'output')

      // In WSDL 2.0, input/output reference elements directly via 'element' attribute
      const inputElementRef = inputEl ? getAttr(inputEl, 'element') : undefined
      const outputElementRef = outputEl ? getAttr(outputEl, 'element') : undefined

      const input: WsdlMessage | null = inputElementRef
        ? { name: `${opName}Input`, parts: [{ name: 'parameters', element: getLocalPart(inputElementRef) }] }
        : null

      const output: WsdlMessage | null = outputElementRef
        ? { name: `${opName}Output`, parts: [{ name: 'parameters', element: getLocalPart(outputElementRef) }] }
        : null

      const opDoc = getDocumentation(opEl, WSDL_20_NS)
      operations.push({ name: opName, documentation: opDoc, input, output })
    }

    const ifDoc = getDocumentation(ifEl, WSDL_20_NS)
    interfaces.push({ name, documentation: ifDoc, operations })
  }

  return interfaces
}

function parseBindings(root: Element): WsdlBinding[] {
  const bindings: WsdlBinding[] = []

  for (const bindEl of getChildElements(root, WSDL_20_NS, 'binding')) {
    const name = getAttr(bindEl, 'name')
    const interfaceAttr = getAttr(bindEl, 'interface')
    const typeAttr = getAttr(bindEl, 'type')
    if (!name) continue

    const interfaceRef = interfaceAttr ? getLocalPart(interfaceAttr) : ''

    let bindingType: BindingType = 'UNKNOWN'
    const soapVersion: SoapVersion = '1.2'
    const style: BindingStyle = 'document'

    // WSDL 2.0 binding type attribute
    if (typeAttr === 'http://www.w3.org/ns/wsdl/soap') {
      bindingType = 'SOAP'
    }

    // WSDL 2.0 typically uses SOAP 1.2

    // Parse operations
    const operations: WsdlBindingOperation[] = []
    for (const opEl of getChildElements(bindEl, WSDL_20_NS, 'operation')) {
      const opName = getAttr(opEl, 'ref')
      if (!opName) continue

      const soapAction = getAttr(opEl, `${WSDL2_SOAP_NS}:action`) ?? ''

      operations.push({
        name: getLocalPart(opName),
        soapAction,
      })
    }

    bindings.push({
      name,
      interfaceRef,
      bindingType,
      soapVersion,
      style,
      operations,
    })
  }

  return bindings
}

function parseServices(root: Element): WsdlService[] {
  const services: WsdlService[] = []

  for (const svcEl of getChildElements(root, WSDL_20_NS, 'service')) {
    const name = getAttr(svcEl, 'name')
    if (!name) continue

    const endpoints: WsdlEndpoint[] = []
    for (const epEl of getChildElements(svcEl, WSDL_20_NS, 'endpoint')) {
      const epName = getAttr(epEl, 'name')
      const binding = getAttr(epEl, 'binding')
      const address = getAttr(epEl, 'address') ?? ''
      if (!epName || !binding) continue

      endpoints.push({
        name: epName,
        bindingRef: getLocalPart(binding),
        address,
      })
    }

    const svcDoc = getDocumentation(svcEl, WSDL_20_NS)
    services.push({ name, documentation: svcDoc, endpoints })
  }

  return services
}
