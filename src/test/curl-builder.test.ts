import { describe, it, expect } from 'vitest'
import { buildCurlCommand } from '@/lib/soap/curl-builder'

describe('cURL Builder', () => {
  const body = '<?xml version="1.0"?>\n<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">\n  <soapenv:Body/>\n</soapenv:Envelope>'

  it('builds a SOAP 1.1 cURL command', () => {
    const curl = buildCurlCommand({
      endpointUrl: 'http://example.com/service',
      soapAction: 'http://example.com/DoThing',
      soapVersion: '1.1',
      body,
    })

    expect(curl).toContain('curl')
    expect(curl).toContain("Content-Type: text/xml; charset=utf-8")
    expect(curl).toContain('SOAPAction: "http://example.com/DoThing"')
    expect(curl).toContain('-d')
    expect(curl).toContain("'http://example.com/service'")
  })

  it('builds a SOAP 1.2 cURL command with action in Content-Type', () => {
    const curl = buildCurlCommand({
      endpointUrl: 'http://example.com/service',
      soapAction: 'http://example.com/DoThing',
      soapVersion: '1.2',
      body,
    })

    expect(curl).toContain('application/soap+xml; charset=utf-8; action="http://example.com/DoThing"')
    expect(curl).not.toContain('SOAPAction')
  })

  it('escapes single quotes in body', () => {
    const curl = buildCurlCommand({
      endpointUrl: 'http://example.com/service',
      soapAction: '',
      soapVersion: '1.1',
      body: "<value>it's a test</value>",
    })

    expect(curl).toContain("it'\\''s a test")
  })

  it('includes custom headers before SOAP headers', () => {
    const curl = buildCurlCommand({
      endpointUrl: 'http://example.com/service',
      soapAction: 'urn:test',
      soapVersion: '1.1',
      body: '<test/>',
      customHeaders: { Authorization: 'Bearer token', 'X-Api-Key': 'abc' },
    })

    expect(curl).toContain("Authorization: Bearer token")
    expect(curl).toContain("X-Api-Key: abc")
    // Custom headers should appear before SOAP headers
    const authIndex = curl.indexOf('Authorization')
    const contentTypeIndex = curl.indexOf('Content-Type')
    expect(authIndex).toBeLessThan(contentTypeIndex)
  })

  it('formats with line continuations', () => {
    const curl = buildCurlCommand({
      endpointUrl: 'http://example.com/service',
      soapAction: 'urn:test',
      soapVersion: '1.1',
      body: '<test/>',
    })

    const lines = curl.split('\\\n')
    expect(lines.length).toBeGreaterThan(1)
  })
})
