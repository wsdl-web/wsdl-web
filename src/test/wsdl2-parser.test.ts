import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseWsdlText, resolveOperations } from '@/lib/wsdl/parser'

function loadFixture(name: string): string {
  return readFileSync(join(__dirname, 'fixtures', name), 'utf-8')
}

describe('WSDL 2.0 Parser', () => {
  const wsdl = parseWsdlText(loadFixture('wsdl20-sample.xml'))

  it('detects WSDL 2.0', () => {
    expect(wsdl.version).toBe('2.0')
  })

  it('parses target namespace', () => {
    expect(wsdl.targetNamespace).toBe('http://example.com/weather')
  })

  it('parses services', () => {
    expect(wsdl.services).toHaveLength(1)
    expect(wsdl.services[0].name).toBe('WeatherService')
  })

  it('parses endpoints', () => {
    const ep = wsdl.services[0].endpoints[0]
    expect(ep.name).toBe('WeatherEndpoint')
    expect(ep.address).toBe('http://example.com/weather')
    expect(ep.bindingRef).toBe('WeatherSoapBinding')
  })

  it('parses bindings', () => {
    const binding = wsdl.bindings[0]
    expect(binding.name).toBe('WeatherSoapBinding')
    expect(binding.bindingType).toBe('SOAP')
    expect(binding.soapVersion).toBe('1.2')
  })

  it('parses interfaces', () => {
    expect(wsdl.interfaces).toHaveLength(1)
    expect(wsdl.interfaces[0].name).toBe('WeatherInterface')
  })

  it('parses interface operations with element references', () => {
    const op = wsdl.interfaces[0].operations[0]
    expect(op.name).toBe('GetWeather')
    expect(op.input).not.toBeNull()
    expect(op.input!.parts[0].element).toBe('GetWeather')
    expect(op.output).not.toBeNull()
    expect(op.output!.parts[0].element).toBe('GetWeatherResponse')
  })

  it('parses service documentation', () => {
    expect(wsdl.services[0].documentation).toBe('Provides weather forecasts and current conditions.')
  })

  it('parses operation documentation', () => {
    expect(wsdl.interfaces[0].operations[0].documentation).toBe(
      'Returns current weather conditions for a given city and country.'
    )
  })

  it('propagates operation documentation to resolved operations', () => {
    const ops = resolveOperations(wsdl)
    expect(ops[0].documentation).toBe(
      'Returns current weather conditions for a given city and country.'
    )
  })

  it('parses XSD types', () => {
    expect(wsdl.types['GetWeather']).toBeDefined()
    expect(wsdl.types['GetWeather'].fields).toHaveLength(2)
  })

  it('resolves operations', () => {
    const ops = resolveOperations(wsdl)
    expect(ops).toHaveLength(1)
    expect(ops[0].operationName).toBe('GetWeather')
    expect(ops[0].soapVersion).toBe('1.2')
    expect(ops[0].endpointAddress).toBe('http://example.com/weather')
  })

  it('resolves soapAction from binding wsoap:action attribute', () => {
    const ops = resolveOperations(wsdl)
    expect(ops[0].soapAction).toBe('http://example.com/GetWeather')
  })
})

describe('WSDL 2.0 Parser – soapAction on interface operation', () => {
  const wsdl = parseWsdlText(loadFixture('wsdl20-interface-soapaction.xml'))

  it('extracts soapAction from wsoap:operation child element', () => {
    const op = wsdl.interfaces[0].operations[0]
    expect(op.soapAction).toBe('getPetById')
  })

  it('resolves soapAction via interface fallback when binding has none', () => {
    const ops = resolveOperations(wsdl)
    expect(ops).toHaveLength(1)
    expect(ops[0].soapAction).toBe('getPetById')
  })
})
