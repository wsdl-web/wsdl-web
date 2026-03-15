import { describe, it, expect } from 'vitest'
import { buildSoapEnvelope } from '@/lib/soap/envelope-builder'
import { SOAP_11_ENVELOPE_NS, SOAP_12_ENVELOPE_NS } from '@/lib/soap/constants'

describe('SOAP Envelope Builder', () => {
  const bodyXml = '<GetPrice xmlns="http://example.com">\n  <ticker>AAPL</ticker>\n</GetPrice>'

  it('builds SOAP 1.1 document-style envelope', () => {
    const envelope = buildSoapEnvelope({
      soapVersion: '1.1',
      style: 'document',
      operationName: 'GetPrice',
      targetNamespace: 'http://example.com',
      bodyXml,
    })

    expect(envelope).toContain(SOAP_11_ENVELOPE_NS)
    expect(envelope).toContain('soapenv:Envelope')
    expect(envelope).toContain('soapenv:Body')
    expect(envelope).toContain('<GetPrice')
    expect(envelope).toContain('<ticker>AAPL</ticker>')
    // Document style should NOT wrap in operation element
    expect(envelope).not.toContain('ns:GetPrice')
  })

  it('builds SOAP 1.2 document-style envelope', () => {
    const envelope = buildSoapEnvelope({
      soapVersion: '1.2',
      style: 'document',
      operationName: 'GetPrice',
      targetNamespace: 'http://example.com',
      bodyXml,
    })

    expect(envelope).toContain(SOAP_12_ENVELOPE_NS)
    expect(envelope).toContain('soapenv:Envelope')
  })

  it('builds SOAP 1.1 RPC-style envelope', () => {
    const envelope = buildSoapEnvelope({
      soapVersion: '1.1',
      style: 'rpc',
      operationName: 'Add',
      targetNamespace: 'http://example.com/calc',
      bodyXml: '<a>1</a>\n<b>2</b>',
    })

    expect(envelope).toContain(SOAP_11_ENVELOPE_NS)
    // RPC style wraps in operation element
    expect(envelope).toContain('ns:Add')
    expect(envelope).toContain('xmlns:ns="http://example.com/calc"')
    expect(envelope).toContain('<a>1</a>')
  })

  it('builds SOAP 1.2 RPC-style envelope', () => {
    const envelope = buildSoapEnvelope({
      soapVersion: '1.2',
      style: 'rpc',
      operationName: 'Add',
      targetNamespace: 'http://example.com/calc',
      bodyXml: '<a>1</a>',
    })

    expect(envelope).toContain(SOAP_12_ENVELOPE_NS)
    expect(envelope).toContain('ns:Add')
  })

  it('includes XML declaration', () => {
    const envelope = buildSoapEnvelope({
      soapVersion: '1.1',
      style: 'document',
      operationName: 'Test',
      targetNamespace: 'http://example.com',
      bodyXml: '<Test/>',
    })

    expect(envelope).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/)
  })
})
