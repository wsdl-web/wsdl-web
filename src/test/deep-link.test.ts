import { describe, it, expect } from 'vitest'
import { parseDeepLink, buildDeepLinkUrl, isRemoteUrl } from '@/lib/deep-link'

function makeLocation(url: string): Location {
  const parsed = new URL(url, 'http://localhost')
  return {
    search: parsed.search,
    hash: parsed.hash,
    href: parsed.href,
    pathname: parsed.pathname,
  } as Location
}

describe('parseDeepLink', () => {
  it('returns nulls when no params', () => {
    const result = parseDeepLink(makeLocation('/wsdl-web-ui/'))
    expect(result.url).toBeNull()
    expect(result.target).toBeNull()
  })

  it('extracts url param', () => {
    const result = parseDeepLink(
      makeLocation('/wsdl-web-ui/?url=https%3A%2F%2Fexample.com%2Fservice%3Fwsdl'),
    )
    expect(result.url).toBe('https://example.com/service?wsdl')
    expect(result.target).toBeNull()
  })

  it('extracts url and full hash target', () => {
    const result = parseDeepLink(
      makeLocation('/wsdl-web-ui/?url=https%3A%2F%2Fexample.com%2Fservice%3Fwsdl#MyService/MyPort/GetData'),
    )
    expect(result.url).toBe('https://example.com/service?wsdl')
    expect(result.target).toEqual({
      service: 'MyService',
      endpoint: 'MyPort',
      operation: 'GetData',
    })
  })

  it('extracts partial hash (group only)', () => {
    const result = parseDeepLink(
      makeLocation('/wsdl-web-ui/?url=https%3A%2F%2Fexample.com%2Fservice#MyService/MyPort'),
    )
    expect(result.target).toEqual({
      service: 'MyService',
      endpoint: 'MyPort',
      operation: undefined,
    })
  })

  it('ignores hash with only one segment', () => {
    const result = parseDeepLink(
      makeLocation('/wsdl-web-ui/?url=https%3A%2F%2Fexample.com%2Fservice#MyService'),
    )
    expect(result.target).toBeNull()
  })

  it('decodes URI-encoded segments', () => {
    const result = parseDeepLink(
      makeLocation('/wsdl-web-ui/?url=x#My%20Service/My%2FPort/Get%20Data'),
    )
    expect(result.target).toEqual({
      service: 'My Service',
      endpoint: 'My/Port',
      operation: 'Get Data',
    })
  })
})

describe('buildDeepLinkUrl', () => {
  const basePath = '/wsdl-web-ui/'

  it('returns basePath when wsdlUrl is empty', () => {
    expect(buildDeepLinkUrl(basePath, '', new Set(), new Set())).toBe(basePath)
  })

  it('returns basePath for file uploads', () => {
    expect(buildDeepLinkUrl(basePath, 'service.wsdl', new Set(), new Set())).toBe(basePath)
  })

  it('builds url-only link when nothing expanded', () => {
    const result = buildDeepLinkUrl(basePath, 'https://example.com/service?wsdl', new Set(), new Set())
    expect(result).toBe('/wsdl-web-ui/?url=https%3A%2F%2Fexample.com%2Fservice%3Fwsdl')
  })

  it('includes hash for expanded operation', () => {
    const ops = new Set(['MyService/MyPort/GetData'])
    const result = buildDeepLinkUrl(basePath, 'https://example.com/svc', ops, new Set())
    expect(result).toBe('/wsdl-web-ui/?url=https%3A%2F%2Fexample.com%2Fsvc#MyService/MyPort/GetData')
  })

  it('includes hash for expanded group when no operations expanded', () => {
    const groups = new Set(['MyService/MyPort'])
    const result = buildDeepLinkUrl(basePath, 'https://example.com/svc', new Set(), groups)
    expect(result).toBe('/wsdl-web-ui/?url=https%3A%2F%2Fexample.com%2Fsvc#MyService/MyPort')
  })

  it('prefers operation over group', () => {
    const ops = new Set(['MyService/MyPort/GetData'])
    const groups = new Set(['MyService/MyPort'])
    const result = buildDeepLinkUrl(basePath, 'https://example.com/svc', ops, groups)
    expect(result).toContain('#MyService/MyPort/GetData')
  })
})

describe('isRemoteUrl', () => {
  it('returns true for http', () => {
    expect(isRemoteUrl('http://example.com')).toBe(true)
  })

  it('returns true for https', () => {
    expect(isRemoteUrl('https://example.com')).toBe(true)
  })

  it('returns false for filenames', () => {
    expect(isRemoteUrl('service.wsdl')).toBe(false)
  })
})
