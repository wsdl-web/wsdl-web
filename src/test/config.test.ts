import { describe, it, expect } from 'vitest'
import { resolveConfig } from '@/config'
import type { WsdlWebConfig } from '@/config'

describe('resolveConfig', () => {
  it('returns defaults when no config provided', () => {
    const result = resolveConfig()
    expect(result.url).toBe('')
    expect(result.urls).toEqual([])
    expect(result.showUrlInput).toBe(true)
    expect(result.showExploreButton).toBe(true)
    expect(result.showBrowseButton).toBe(true)
    expect(result.baseUrlOverride).toBe('')
  })

  it('preserves url when provided', () => {
    const result = resolveConfig({ url: 'https://example.com/svc?wsdl' })
    expect(result.url).toBe('https://example.com/svc?wsdl')
  })

  it('normalizes string urls to WsdlSpec objects', () => {
    const result = resolveConfig({
      urls: [
        'https://example.com/users?wsdl',
        'https://api.test.com/orders',
      ],
    })
    expect(result.urls).toHaveLength(2)
    expect(result.urls[0]).toEqual({
      label: 'example.com/users',
      url: 'https://example.com/users?wsdl',
    })
    expect(result.urls[1]).toEqual({
      label: 'api.test.com/orders',
      url: 'https://api.test.com/orders',
    })
  })

  it('preserves WsdlSpec objects as-is', () => {
    const result = resolveConfig({
      urls: [{ label: 'My Service', url: 'https://example.com/svc?wsdl' }],
    })
    expect(result.urls).toEqual([
      { label: 'My Service', url: 'https://example.com/svc?wsdl' },
    ])
  })

  it('handles mixed string and object entries', () => {
    const config: WsdlWebConfig = {
      urls: [
        'https://example.com/svc1?wsdl',
        { label: 'Custom Label', url: 'https://example.com/svc2?wsdl' },
      ],
    }
    const result = resolveConfig(config)
    expect(result.urls).toHaveLength(2)
    expect(result.urls[0].label).toBe('example.com/svc1')
    expect(result.urls[1].label).toBe('Custom Label')
  })

  it('derives label from hostname when path is empty', () => {
    const result = resolveConfig({
      urls: ['https://example.com/'],
    })
    expect(result.urls[0].label).toBe('example.com')
  })

  it('uses raw string as label for invalid URLs', () => {
    const result = resolveConfig({
      urls: ['not-a-url'],
    })
    expect(result.urls[0]).toEqual({ label: 'not-a-url', url: 'not-a-url' })
  })
})
