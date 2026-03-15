import { describe, it, expect } from 'vitest'
import { prettyPrintXml } from '@/lib/xml/formatter'

describe('XML Formatter', () => {
  it('formats nested XML with proper indentation', () => {
    const input = '<root><child><grandchild>value</grandchild></child></root>'
    const result = prettyPrintXml(input)
    const lines = result.split('\n')

    expect(lines[0]).toBe('<root>')
    expect(lines[1]).toBe('  <child>')
    expect(lines[2]).toBe('    <grandchild>value</grandchild>')
    expect(lines[3]).toBe('  </child>')
    expect(lines[4]).toBe('</root>')
  })

  it('handles self-closing tags', () => {
    const input = '<root><empty/></root>'
    const result = prettyPrintXml(input)
    expect(result).toContain('  <empty/>')
  })

  it('preserves XML declaration', () => {
    const input = '<?xml version="1.0"?><root/>'
    const result = prettyPrintXml(input)
    expect(result).toContain('<?xml version="1.0"?>')
  })
})
