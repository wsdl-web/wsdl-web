export type WsdlVersion = '1.1' | '2.0'
export type SoapVersion = '1.1' | '1.2'
export type BindingStyle = 'document' | 'rpc'
export type BindingType = 'SOAP' | 'HTTP' | 'UNKNOWN'

export interface WsdlDocument {
  version: WsdlVersion
  targetNamespace: string
  name?: string
  services: WsdlService[]
  bindings: WsdlBinding[]
  interfaces: WsdlInterface[]
  types: XsdTypeMap
}

export interface WsdlService {
  name: string
  documentation?: string
  endpoints: WsdlEndpoint[]
}

export interface WsdlEndpoint {
  name: string
  bindingRef: string
  address: string
}

export interface WsdlBinding {
  name: string
  interfaceRef: string
  bindingType: BindingType
  soapVersion: SoapVersion
  style: BindingStyle
  operations: WsdlBindingOperation[]
}

export interface WsdlBindingOperation {
  name: string
  soapAction: string
  style?: BindingStyle
  inputRef?: string
  outputRef?: string
}

export interface WsdlInterface {
  name: string
  documentation?: string
  operations: WsdlInterfaceOperation[]
}

export interface WsdlInterfaceOperation {
  name: string
  documentation?: string
  soapAction?: string
  input: WsdlMessage | null
  output: WsdlMessage | null
}

export interface WsdlMessage {
  name: string
  parts: WsdlMessagePart[]
}

export interface WsdlMessagePart {
  name: string
  element?: string
  type?: string
}

export type XsdTypeMap = Record<string, XsdType>

export interface XsdType {
  name: string
  kind: 'simple' | 'complex' | 'element'
  fields: XsdField[]
  restriction?: { base: string }
  elementType?: string
}

export interface XsdField {
  name: string
  type: string
  minOccurs: number
  maxOccurs: number | 'unbounded'
  children?: XsdField[]
}

/** Resolved operation with all the info needed to render and invoke */
export interface ResolvedOperation {
  serviceName: string
  endpointName: string
  endpointAddress: string
  bindingName: string
  bindingStyle: BindingStyle
  soapVersion: SoapVersion
  operationName: string
  documentation?: string
  soapAction: string
  input: WsdlMessage | null
  output: WsdlMessage | null
  targetNamespace: string
}
