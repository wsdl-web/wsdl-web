import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseWsdlText, resolveOperations } from '@/lib/wsdl/parser'
import { resolveImports } from '@/lib/wsdl/import-resolver'
import { parseXml } from '@/lib/xml/parser'

function loadFixture(name: string): string {
  return readFileSync(join(__dirname, 'fixtures', name), 'utf-8')
}

function mockFetchFn(fixtures: Record<string, string>) {
  return async (url: string) => {
    const text = fixtures[url]
    if (text === undefined) {
      return { ok: false, status: 404, statusText: 'Not Found', text: async () => '' } as Response
    }
    return { ok: true, status: 200, statusText: 'OK', text: async () => text } as Response
  }
}

describe('Import Resolver', () => {
  describe('WSDL import', () => {
    const mainText = loadFixture('wsdl11-with-import.xml')
    const importedText = loadFixture('wsdl11-imported.xml')
    const fetchFn = mockFetchFn({
      'http://example.com/imported.wsdl': importedText,
    })

    it('merges services from imported WSDL', async () => {
      const xmlDoc = parseXml(mainText)
      const doc = parseWsdlText(mainText)
      const resolved = await resolveImports(doc, xmlDoc, 'http://example.com/main.wsdl', fetchFn)

      const serviceNames = resolved.services.map((s) => s.name)
      expect(serviceNames).toContain('MainService')
      expect(serviceNames).toContain('ImportedService')
    })

    it('merges bindings from imported WSDL', async () => {
      const xmlDoc = parseXml(mainText)
      const doc = parseWsdlText(mainText)
      const resolved = await resolveImports(doc, xmlDoc, 'http://example.com/main.wsdl', fetchFn)

      const bindingNames = resolved.bindings.map((b) => b.name)
      expect(bindingNames).toContain('MainSoapBinding')
      expect(bindingNames).toContain('ImportedSoapBinding')
    })

    it('merges interfaces from imported WSDL', async () => {
      const xmlDoc = parseXml(mainText)
      const doc = parseWsdlText(mainText)
      const resolved = await resolveImports(doc, xmlDoc, 'http://example.com/main.wsdl', fetchFn)

      const interfaceNames = resolved.interfaces.map((i) => i.name)
      expect(interfaceNames).toContain('MainPortType')
      expect(interfaceNames).toContain('ImportedPortType')
    })

    it('merges types from imported WSDL', async () => {
      const xmlDoc = parseXml(mainText)
      const doc = parseWsdlText(mainText)
      const resolved = await resolveImports(doc, xmlDoc, 'http://example.com/main.wsdl', fetchFn)

      expect(resolved.types['Echo']).toBeDefined()
      expect(resolved.types['Ping']).toBeDefined()
    })

    it('resolves operations from both main and imported WSDL', async () => {
      const xmlDoc = parseXml(mainText)
      const doc = parseWsdlText(mainText)
      const resolved = await resolveImports(doc, xmlDoc, 'http://example.com/main.wsdl', fetchFn)
      const ops = resolveOperations(resolved)

      const opNames = ops.map((o) => o.operationName)
      expect(opNames).toContain('Ping')
      expect(opNames).toContain('Echo')
    })
  })

  describe('XSD import', () => {
    const mainText = loadFixture('wsdl11-with-xsd-import.xml')
    const xsdText = loadFixture('common-types.xsd')
    const fetchFn = mockFetchFn({
      'http://example.com/common-types.xsd': xsdText,
    })

    it('merges types from imported XSD', async () => {
      const xmlDoc = parseXml(mainText)
      const doc = parseWsdlText(mainText)
      const resolved = await resolveImports(doc, xmlDoc, 'http://example.com/order.wsdl', fetchFn)

      expect(resolved.types['Address']).toBeDefined()
      expect(resolved.types['Address'].kind).toBe('complex')
      expect(resolved.types['Address'].fields).toHaveLength(3)
    })

    it('merges simple types from imported XSD', async () => {
      const xmlDoc = parseXml(mainText)
      const doc = parseWsdlText(mainText)
      const resolved = await resolveImports(doc, xmlDoc, 'http://example.com/order.wsdl', fetchFn)

      expect(resolved.types['Currency']).toBeDefined()
      expect(resolved.types['Currency'].kind).toBe('simple')
    })

    it('preserves inline types alongside imported types', async () => {
      const xmlDoc = parseXml(mainText)
      const doc = parseWsdlText(mainText)
      const resolved = await resolveImports(doc, xmlDoc, 'http://example.com/order.wsdl', fetchFn)

      expect(resolved.types['PlaceOrder']).toBeDefined()
      expect(resolved.types['Address']).toBeDefined()
    })
  })

  describe('circular imports', () => {
    const circularAText = loadFixture('wsdl11-circular-a.xml')
    const circularBText = loadFixture('wsdl11-circular-b.xml')
    const fetchFn = mockFetchFn({
      'http://example.com/circular-a.wsdl': circularAText,
      'http://example.com/circular-b.wsdl': circularBText,
    })

    it('terminates without error', async () => {
      const xmlDoc = parseXml(circularAText)
      const doc = parseWsdlText(circularAText)
      const resolved = await resolveImports(doc, xmlDoc, 'http://example.com/circular-a.wsdl', fetchFn)

      expect(resolved.services).toHaveLength(2)
      const serviceNames = resolved.services.map((s) => s.name)
      expect(serviceNames).toContain('CircularAService')
      expect(serviceNames).toContain('CircularBService')
    })
  })

  describe('failed imports', () => {
    const mainText = loadFixture('wsdl11-with-import.xml')
    const fetchFn = mockFetchFn({}) // no fixtures — all fetches will 404

    it('gracefully skips failed imports', async () => {
      const xmlDoc = parseXml(mainText)
      const doc = parseWsdlText(mainText)
      const resolved = await resolveImports(doc, xmlDoc, 'http://example.com/main.wsdl', fetchFn)

      // Should still have the main service
      expect(resolved.services).toHaveLength(1)
      expect(resolved.services[0].name).toBe('MainService')
    })
  })

  describe('relative URL resolution', () => {
    const mainText = loadFixture('wsdl11-with-xsd-import.xml')
    const xsdText = loadFixture('common-types.xsd')

    it('resolves relative schemaLocation against base URL', async () => {
      // Modify the fixture to use a relative URL by adjusting what the mock returns
      const relativeMainText = mainText.replace(
        'schemaLocation="http://example.com/common-types.xsd"',
        'schemaLocation="common-types.xsd"',
      )
      const fetchFn = mockFetchFn({
        'http://example.com/schemas/common-types.xsd': xsdText,
      })

      const xmlDoc = parseXml(relativeMainText)
      const doc = parseWsdlText(relativeMainText)
      const resolved = await resolveImports(doc, xmlDoc, 'http://example.com/schemas/order.wsdl', fetchFn)

      expect(resolved.types['Address']).toBeDefined()
    })
  })

  describe('parseWsdlText without imports', () => {
    it('still works for self-contained WSDLs', () => {
      const text = loadFixture('wsdl11-document.xml')
      const doc = parseWsdlText(text)

      expect(doc.services).toHaveLength(1)
      expect(doc.types['GetLastTradePrice']).toBeDefined()
    })
  })
})
