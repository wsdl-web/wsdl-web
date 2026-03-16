import { createContext, useContext } from 'react'
import type { WsdlWebConfig } from './config'
import { defaultConfig } from './config'

export const ConfigContext = createContext<Required<WsdlWebConfig>>(
  defaultConfig as Required<WsdlWebConfig>,
)

export function useConfig(): Required<WsdlWebConfig> {
  return useContext(ConfigContext)
}
