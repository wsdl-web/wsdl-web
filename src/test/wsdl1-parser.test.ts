import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseWsdlText, resolveOperations } from '@/lib/wsdl/parser'

function loadFixture(name: string): string {
  return readFileSync(join(__dirname, 'fixtures', name), 'utf-8')
}

describe('WSDL 1.1 Parser', () => {
  describe('document style', () => {
    const wsdl = parseWsdlText(loadFixture('wsdl11-document.xml'))

    it('detects WSDL 1.1', () => {
      expect(wsdl.version).toBe('1.1')
    })

    it('parses target namespace', () => {
      expect(wsdl.targetNamespace).toBe('http://example.com/stockquote')
    })

    it('parses services', () => {
      expect(wsdl.services).toHaveLength(1)
      expect(wsdl.services[0].name).toBe('StockQuoteService')
    })

    it('parses endpoints', () => {
      const endpoints = wsdl.services[0].endpoints
      expect(endpoints).toHaveLength(1)
      expect(endpoints[0].name).toBe('StockQuotePort')
      expect(endpoints[0].address).toBe('http://example.com/stockquote')
      expect(endpoints[0].bindingRef).toBe('StockQuoteSoapBinding')
    })

    it('parses bindings with document style', () => {
      expect(wsdl.bindings).toHaveLength(1)
      const binding = wsdl.bindings[0]
      expect(binding.name).toBe('StockQuoteSoapBinding')
      expect(binding.style).toBe('document')
      expect(binding.soapVersion).toBe('1.1')
      expect(binding.bindingType).toBe('SOAP')
    })

    it('parses binding operations with soapAction', () => {
      const ops = wsdl.bindings[0].operations
      expect(ops).toHaveLength(1)
      expect(ops[0].name).toBe('GetLastTradePrice')
      expect(ops[0].soapAction).toBe('http://example.com/GetLastTradePrice')
    })

    it('parses interfaces (portTypes)', () => {
      expect(wsdl.interfaces).toHaveLength(1)
      expect(wsdl.interfaces[0].name).toBe('StockQuotePortType')
      expect(wsdl.interfaces[0].operations).toHaveLength(1)
    })

    it('parses operation input/output messages', () => {
      const op = wsdl.interfaces[0].operations[0]
      expect(op.name).toBe('GetLastTradePrice')
      expect(op.input).not.toBeNull()
      expect(op.input!.parts).toHaveLength(1)
      expect(op.input!.parts[0].element).toBe('tns:GetLastTradePrice')
      expect(op.output).not.toBeNull()
    })

    it('parses service documentation', () => {
      expect(wsdl.services[0].documentation).toBe('Provides real-time stock quote information.')
    })

    it('parses operation documentation', () => {
      expect(wsdl.interfaces[0].operations[0].documentation).toBe(
        'Returns the last recorded trade price for a given ticker symbol.'
      )
    })

    it('propagates operation documentation to resolved operations', () => {
      const ops = resolveOperations(wsdl)
      expect(ops[0].documentation).toBe(
        'Returns the last recorded trade price for a given ticker symbol.'
      )
    })

    it('parses XSD types', () => {
      expect(Object.keys(wsdl.types).length).toBeGreaterThan(0)
      expect(wsdl.types['GetLastTradePrice']).toBeDefined()
      expect(wsdl.types['GetLastTradePrice'].kind).toBe('element')
    })

    it('resolves operations', () => {
      const ops = resolveOperations(wsdl)
      expect(ops).toHaveLength(1)
      expect(ops[0].operationName).toBe('GetLastTradePrice')
      expect(ops[0].bindingStyle).toBe('document')
      expect(ops[0].soapVersion).toBe('1.1')
      expect(ops[0].endpointAddress).toBe('http://example.com/stockquote')
      expect(ops[0].soapAction).toBe('http://example.com/GetLastTradePrice')
    })
  })

  describe('RPC style', () => {
    const wsdl = parseWsdlText(loadFixture('wsdl11-rpc.xml'))

    it('detects RPC binding style', () => {
      expect(wsdl.bindings[0].style).toBe('rpc')
    })

    it('parses type-based message parts', () => {
      const op = wsdl.interfaces[0].operations[0]
      expect(op.input!.parts[0].type).toBe('tns:AddRequest')
      expect(op.input!.parts[0].element).toBeUndefined()
    })

    it('resolves RPC operations', () => {
      const ops = resolveOperations(wsdl)
      expect(ops).toHaveLength(1)
      expect(ops[0].bindingStyle).toBe('rpc')
    })
  })
})
