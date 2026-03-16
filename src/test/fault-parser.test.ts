import { describe, it, expect } from 'vitest'
import { parseSoapFault } from '@/lib/soap/fault-parser'

describe('SOAP Fault Parser', () => {
  describe('SOAP 1.1', () => {
    it('parses a fault with all fields', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>soap:Server</faultcode>
      <faultstring>Server was unable to process request.</faultstring>
      <faultactor>http://example.com/actor</faultactor>
      <detail>
        <ErrorInfo xmlns="http://example.com/errors">
          <code>500</code>
          <message>Internal error</message>
        </ErrorInfo>
      </detail>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`

      const fault = parseSoapFault(xml)
      expect(fault).not.toBeNull()
      expect(fault!.code).toBe('soap:Server')
      expect(fault!.string).toBe('Server was unable to process request.')
      expect(fault!.actor).toBe('http://example.com/actor')
      expect(fault!.detail).toContain('ErrorInfo')
      expect(fault!.detail).toContain('Internal error')
    })

    it('parses a fault with only required fields', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>soap:Client</faultcode>
      <faultstring>Invalid input</faultstring>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`

      const fault = parseSoapFault(xml)
      expect(fault).not.toBeNull()
      expect(fault!.code).toBe('soap:Client')
      expect(fault!.string).toBe('Invalid input')
      expect(fault!.actor).toBeUndefined()
      expect(fault!.detail).toBeUndefined()
    })
  })

  describe('SOAP 1.2', () => {
    it('parses a fault with all fields', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body>
    <soap:Fault>
      <soap:Code>
        <soap:Value>soap:Receiver</soap:Value>
      </soap:Code>
      <soap:Reason>
        <soap:Text xml:lang="en">Processing failed</soap:Text>
      </soap:Reason>
      <soap:Role>http://example.com/role</soap:Role>
      <soap:Node>http://example.com/node</soap:Node>
      <soap:Detail>
        <ErrorDetail xmlns="http://example.com/errors">
          <timestamp>2024-01-01T00:00:00Z</timestamp>
        </ErrorDetail>
      </soap:Detail>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`

      const fault = parseSoapFault(xml)
      expect(fault).not.toBeNull()
      expect(fault!.code).toBe('soap:Receiver')
      expect(fault!.string).toBe('Processing failed')
      expect(fault!.actor).toBe('http://example.com/role')
      expect(fault!.node).toBe('http://example.com/node')
      expect(fault!.detail).toContain('ErrorDetail')
      expect(fault!.detail).toContain('2024-01-01T00:00:00Z')
    })

    it('parses a fault with only required fields', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body>
    <soap:Fault>
      <soap:Code>
        <soap:Value>soap:Sender</soap:Value>
      </soap:Code>
      <soap:Reason>
        <soap:Text xml:lang="en">Bad request</soap:Text>
      </soap:Reason>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`

      const fault = parseSoapFault(xml)
      expect(fault).not.toBeNull()
      expect(fault!.code).toBe('soap:Sender')
      expect(fault!.string).toBe('Bad request')
      expect(fault!.actor).toBeUndefined()
      expect(fault!.node).toBeUndefined()
      expect(fault!.detail).toBeUndefined()
    })
  })

  describe('non-fault responses', () => {
    it('returns null for a normal SOAP response', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetPriceResponse xmlns="http://example.com">
      <price>42.00</price>
    </GetPriceResponse>
  </soap:Body>
</soap:Envelope>`

      expect(parseSoapFault(xml)).toBeNull()
    })

    it('returns null for malformed XML', () => {
      expect(parseSoapFault('<not valid xml>>>')).toBeNull()
    })

    it('returns null for empty string', () => {
      expect(parseSoapFault('')).toBeNull()
    })
  })
})
