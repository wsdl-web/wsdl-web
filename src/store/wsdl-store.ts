import { create } from 'zustand'
import type { WsdlDocument, ResolvedOperation, XsdTypeMap } from '@/lib/wsdl/types'
import { fetchAndParseWsdl, parseWsdlText, resolveOperations } from '@/lib/wsdl/parser'
import { buildSoapEnvelope } from '@/lib/soap/envelope-builder'
import { sendSoapRequest } from '@/lib/soap/request-sender'
import { generateSampleXml } from '@/lib/wsdl/xsd-utils'
import type { SoapResponse } from '@/lib/soap/types'

export interface OperationRequestState {
  requestXml: string
  response: SoapResponse | null
  isExecuting: boolean
  error: string | null
  tryItOut: boolean
}

interface WsdlStore {
  // WSDL URL input
  wsdlUrl: string
  setWsdlUrl: (url: string) => void

  // Loading
  isLoading: boolean
  error: string | null

  // Parsed data
  document: WsdlDocument | null
  operations: ResolvedOperation[]
  loadWsdl: (url: string) => Promise<void>
  loadWsdlFromText: (text: string, sourceName: string) => void

  // Base URL override
  baseUrlOverride: string
  setBaseUrlOverride: (url: string) => void
  getEffectiveEndpoint: (op: ResolvedOperation) => string

  // UI state
  expandedGroups: Set<string>
  toggleGroup: (id: string) => void
  expandedOperations: Set<string>
  toggleOperation: (id: string) => void

  // Per-operation request state
  requestStates: Record<string, OperationRequestState>
  getOrCreateRequestState: (opKey: string, op: ResolvedOperation) => OperationRequestState
  setTryItOut: (opKey: string, value: boolean) => void
  setRequestXml: (opKey: string, xml: string) => void
  executeRequest: (opKey: string, op: ResolvedOperation) => Promise<void>
}

function buildOperationKey(op: ResolvedOperation): string {
  return `${op.serviceName}/${op.endpointName}/${op.operationName}`
}

function buildInitialRequestXml(op: ResolvedOperation, types: XsdTypeMap): string {
  const parts = op.input?.parts ?? []
  const bodyXml = generateSampleXml(op.operationName, op.targetNamespace, parts, types)
  return buildSoapEnvelope({
    soapVersion: op.soapVersion,
    style: op.bindingStyle,
    operationName: op.operationName,
    targetNamespace: op.targetNamespace,
    bodyXml,
  })
}

export const useWsdlStore = create<WsdlStore>((set, get) => ({
  wsdlUrl: '',
  setWsdlUrl: (url) => set({ wsdlUrl: url }),

  isLoading: false,
  error: null,

  document: null,
  operations: [],

  loadWsdl: async (url: string) => {
    set({ isLoading: true, error: null, document: null, operations: [], requestStates: {} })
    try {
      const doc = await fetchAndParseWsdl(url)
      const ops = resolveOperations(doc)
      set({
        document: doc,
        operations: ops,
        isLoading: false,
        wsdlUrl: url,
        expandedGroups: new Set(),
        expandedOperations: new Set(),
      })
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load WSDL',
      })
    }
  },

  loadWsdlFromText: (text: string, sourceName: string) => {
    set({ isLoading: true, error: null, document: null, operations: [], requestStates: {} })
    try {
      const doc = parseWsdlText(text)
      const ops = resolveOperations(doc)
      set({
        document: doc,
        operations: ops,
        isLoading: false,
        wsdlUrl: sourceName,
        expandedGroups: new Set(),
        expandedOperations: new Set(),
      })
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to parse WSDL',
      })
    }
  },

  baseUrlOverride: '',
  setBaseUrlOverride: (url) => set({ baseUrlOverride: url }),
  getEffectiveEndpoint: (op) => {
    const override = get().baseUrlOverride.trim()
    if (!override) return op.endpointAddress
    try {
      const original = new URL(op.endpointAddress)
      const base = override.endsWith('/') ? override.slice(0, -1) : override
      return base + original.pathname
    } catch {
      // If the original address isn't a valid URL, just prepend
      return override + op.endpointAddress
    }
  },

  expandedGroups: new Set(),
  toggleGroup: (id) =>
    set((state) => {
      const next = new Set(state.expandedGroups)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { expandedGroups: next }
    }),

  expandedOperations: new Set(),
  toggleOperation: (id) =>
    set((state) => {
      const next = new Set(state.expandedOperations)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { expandedOperations: next }
    }),

  requestStates: {},

  getOrCreateRequestState: (opKey, op) => {
    const existing = get().requestStates[opKey]
    if (existing) return existing
    const types = get().document?.types ?? {}
    const initial: OperationRequestState = {
      requestXml: buildInitialRequestXml(op, types),
      response: null,
      isExecuting: false,
      error: null,
      tryItOut: false,
    }
    set((state) => ({
      requestStates: { ...state.requestStates, [opKey]: initial },
    }))
    return initial
  },

  setTryItOut: (opKey, value) =>
    set((state) => ({
      requestStates: {
        ...state.requestStates,
        [opKey]: { ...state.requestStates[opKey], tryItOut: value },
      },
    })),

  setRequestXml: (opKey, xml) =>
    set((state) => ({
      requestStates: {
        ...state.requestStates,
        [opKey]: { ...state.requestStates[opKey], requestXml: xml },
      },
    })),

  executeRequest: async (opKey, op) => {
    const reqState = get().requestStates[opKey]
    if (!reqState) return

    set((state) => ({
      requestStates: {
        ...state.requestStates,
        [opKey]: { ...reqState, isExecuting: true, error: null, response: null },
      },
    }))

    try {
      const response = await sendSoapRequest({
        endpointUrl: get().getEffectiveEndpoint(op),
        soapAction: op.soapAction,
        soapVersion: op.soapVersion,
        envelopeXml: reqState.requestXml,
      })
      set((state) => ({
        requestStates: {
          ...state.requestStates,
          [opKey]: { ...state.requestStates[opKey], isExecuting: false, response },
        },
      }))
    } catch (err) {
      set((state) => ({
        requestStates: {
          ...state.requestStates,
          [opKey]: {
            ...state.requestStates[opKey],
            isExecuting: false,
            error: err instanceof Error ? err.message : 'Request failed',
          },
        },
      }))
    }
  },
}))

export { buildOperationKey }
