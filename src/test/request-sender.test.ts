import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendSoapRequest } from '@/lib/soap/request-sender'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function fakeResponse(body = '<ok/>') {
  return {
    status: 200,
    statusText: 'OK',
    text: () => Promise.resolve(body),
    headers: new Headers(),
  }
}

beforeEach(() => {
  mockFetch.mockReset()
  mockFetch.mockResolvedValue(fakeResponse())
})

describe('sendSoapRequest', () => {
  it('includes custom headers in the request', async () => {
    await sendSoapRequest({
      endpointUrl: 'http://example.com/ws',
      soapAction: 'urn:test',
      soapVersion: '1.1',
      envelopeXml: '<Envelope/>',
      customHeaders: { Authorization: 'Bearer abc', 'X-Api-Key': '123' },
    })

    const [, init] = mockFetch.mock.calls[0]
    expect(init.headers['Authorization']).toBe('Bearer abc')
    expect(init.headers['X-Api-Key']).toBe('123')
  })

  it('SOAP headers take precedence over custom headers', async () => {
    await sendSoapRequest({
      endpointUrl: 'http://example.com/ws',
      soapAction: 'urn:test',
      soapVersion: '1.1',
      envelopeXml: '<Envelope/>',
      customHeaders: { 'Content-Type': 'application/json' },
    })

    const [, init] = mockFetch.mock.calls[0]
    expect(init.headers['Content-Type']).toBe('text/xml; charset=utf-8')
  })

  it('works without custom headers', async () => {
    await sendSoapRequest({
      endpointUrl: 'http://example.com/ws',
      soapAction: 'urn:test',
      soapVersion: '1.2',
      envelopeXml: '<Envelope/>',
    })

    const [, init] = mockFetch.mock.calls[0]
    expect(init.headers['Content-Type']).toContain('application/soap+xml')
  })
})
