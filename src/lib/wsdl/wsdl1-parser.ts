import type {
  WsdlDocument,
  WsdlService,
  WsdlEndpoint,
  WsdlBinding,
  WsdlBindingOperation,
  WsdlInterface,
  WsdlInterfaceOperation,
  WsdlMessage,
  WsdlMessagePart,
  BindingStyle,
  BindingType,
  SoapVersion,
} from './types'
import { WSDL_11_NS, SOAP_11_BINDING_NS, SOAP_12_BINDING_NS } from '../soap/constants'
import { getChildElements, getFirstChildElement, getAttr, getLocalPart, getDocumentation } from './xml-helpers'
import { parseXsdTypes } from './xsd-utils'

/**
 * Parse a WSDL 1.1 document.
 */
export function parseWsdl1(doc: Document): WsdlDocument {
  const root = doc.documentElement
  const targetNamespace = getAttr(root, 'targetNamespace') ?? ''
  const name = getAttr(root, 'name')

  // Parse types (XSD schemas)
  const typesEl = getFirstChildElement(root, WSDL_11_NS, 'types')
  const types = parseXsdTypes(typesEl)

  // Parse messages
  const messages = parseMessages(root)

  // Parse portTypes (interfaces)
  const interfaces = parsePortTypes(root, messages)

  // Parse bindings
  const bindings = parseBindings(root)

  // Parse services
  const services = parseServices(root)

  return {
    version: '1.1',
    targetNamespace,
    name,
    services,
    bindings,
    interfaces,
    types,
  }
}

function parseMessages(root: Element): Map<string, WsdlMessage> {
  const messageMap = new Map<string, WsdlMessage>()
  for (const msgEl of getChildElements(root, WSDL_11_NS, 'message')) {
    const name = getAttr(msgEl, 'name')
    if (!name) continue

    const parts: WsdlMessagePart[] = []
    for (const partEl of getChildElements(msgEl, WSDL_11_NS, 'part')) {
      const partName = getAttr(partEl, 'name') ?? ''
      const element = getAttr(partEl, 'element')
      const type = getAttr(partEl, 'type')
      parts.push({ name: partName, element, type })
    }

    messageMap.set(name, { name, parts })
  }
  return messageMap
}

function parsePortTypes(
  root: Element,
  messages: Map<string, WsdlMessage>,
): WsdlInterface[] {
  const interfaces: WsdlInterface[] = []

  for (const ptEl of getChildElements(root, WSDL_11_NS, 'portType')) {
    const name = getAttr(ptEl, 'name')
    if (!name) continue

    const operations: WsdlInterfaceOperation[] = []
    for (const opEl of getChildElements(ptEl, WSDL_11_NS, 'operation')) {
      const opName = getAttr(opEl, 'name')
      if (!opName) continue

      const inputEl = getFirstChildElement(opEl, WSDL_11_NS, 'input')
      const outputEl = getFirstChildElement(opEl, WSDL_11_NS, 'output')

      const inputMsgRef = inputEl ? getAttr(inputEl, 'message') : undefined
      const outputMsgRef = outputEl ? getAttr(outputEl, 'message') : undefined

      const inputMsg = inputMsgRef ? messages.get(getLocalPart(inputMsgRef)) ?? null : null
      const outputMsg = outputMsgRef ? messages.get(getLocalPart(outputMsgRef)) ?? null : null

      const opDoc = getDocumentation(opEl, WSDL_11_NS)
      operations.push({ name: opName, documentation: opDoc, input: inputMsg, output: outputMsg })
    }

    const ptDoc = getDocumentation(ptEl, WSDL_11_NS)
    interfaces.push({ name, documentation: ptDoc, operations })
  }

  return interfaces
}

function parseBindings(root: Element): WsdlBinding[] {
  const bindings: WsdlBinding[] = []

  for (const bindEl of getChildElements(root, WSDL_11_NS, 'binding')) {
    const name = getAttr(bindEl, 'name')
    const typeRef = getAttr(bindEl, 'type')
    if (!name || !typeRef) continue

    const interfaceRef = getLocalPart(typeRef)

    // Detect SOAP version and binding info
    let bindingType: BindingType = 'UNKNOWN'
    let soapVersion: SoapVersion = '1.1'
    let style: BindingStyle = 'document'

    const soap11Binding = getFirstChildElement(bindEl, SOAP_11_BINDING_NS, 'binding')
    const soap12Binding = getFirstChildElement(bindEl, SOAP_12_BINDING_NS, 'binding')

    if (soap11Binding) {
      bindingType = 'SOAP'
      soapVersion = '1.1'
      style = (getAttr(soap11Binding, 'style') as BindingStyle) ?? 'document'
    } else if (soap12Binding) {
      bindingType = 'SOAP'
      soapVersion = '1.2'
      style = (getAttr(soap12Binding, 'style') as BindingStyle) ?? 'document'
    }

    // Parse operations
    const operations: WsdlBindingOperation[] = []
    for (const opEl of getChildElements(bindEl, WSDL_11_NS, 'operation')) {
      const opName = getAttr(opEl, 'name')
      if (!opName) continue

      const soapNs = soapVersion === '1.2' ? SOAP_12_BINDING_NS : SOAP_11_BINDING_NS
      const soapOp = getFirstChildElement(opEl, soapNs, 'operation')
      const soapAction = soapOp ? (getAttr(soapOp, 'soapAction') ?? '') : ''
      const opStyle = soapOp ? (getAttr(soapOp, 'style') as BindingStyle | undefined) : undefined

      // Get input/output references
      const inputEl = getFirstChildElement(opEl, WSDL_11_NS, 'input')
      const outputEl = getFirstChildElement(opEl, WSDL_11_NS, 'output')

      operations.push({
        name: opName,
        soapAction,
        style: opStyle,
        inputRef: inputEl ? getAttr(inputEl, 'name') : undefined,
        outputRef: outputEl ? getAttr(outputEl, 'name') : undefined,
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

  for (const svcEl of getChildElements(root, WSDL_11_NS, 'service')) {
    const name = getAttr(svcEl, 'name')
    if (!name) continue

    const endpoints: WsdlEndpoint[] = []
    for (const portEl of getChildElements(svcEl, WSDL_11_NS, 'port')) {
      const portName = getAttr(portEl, 'name')
      const binding = getAttr(portEl, 'binding')
      if (!portName || !binding) continue

      // Get address from soap:address or soap12:address
      const addr11 = getFirstChildElement(portEl, SOAP_11_BINDING_NS, 'address')
      const addr12 = getFirstChildElement(portEl, SOAP_12_BINDING_NS, 'address')
      const address = addr11
        ? (getAttr(addr11, 'location') ?? '')
        : addr12
          ? (getAttr(addr12, 'location') ?? '')
          : ''

      endpoints.push({
        name: portName,
        bindingRef: getLocalPart(binding),
        address,
      })
    }

    const svcDoc = getDocumentation(svcEl, WSDL_11_NS)
    services.push({ name, documentation: svcDoc, endpoints })
  }

  return services
}
