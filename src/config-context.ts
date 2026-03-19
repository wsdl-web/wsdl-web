import { createContext, useContext } from 'react'
import type { ResolvedWsdlWebConfig } from './config'
import { defaultConfig } from './config'

export const ConfigContext = createContext<ResolvedWsdlWebConfig>(defaultConfig)

export function useConfig(): ResolvedWsdlWebConfig {
  return useContext(ConfigContext)
}
