export interface CustomHeader {
  id: string
  key: string
  value: string
  enabled: boolean
}

export interface SoapRequest {
  endpointUrl: string
  soapAction: string
  soapVersion: '1.1' | '1.2'
  envelopeXml: string
  customHeaders?: Record<string, string>
}

export interface SoapResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  durationMs: number
}
