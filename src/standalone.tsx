/**
 * Standalone entry point for the prebuilt dist bundle.
 *
 * Exposes `WsdlWeb.init(domNode, config)` on the global `window` object
 * so users can embed wsdl-web in any HTML page without a build step.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import type { WsdlWebConfig } from './config'
import { WsdlWeb } from './WsdlWeb'
import './index.css'

interface WsdlWebStandalone {
  /**
   * Mount wsdl-web into a DOM element.
   *
   * @param domNode - The container element to render into.
   * @param config  - Configuration options.
   */
  init(domNode: HTMLElement, config?: WsdlWebConfig): void
}

const WsdlWebBundle: WsdlWebStandalone = {
  init(domNode: HTMLElement, config?: WsdlWebConfig) {
    const root = createRoot(domNode)
    root.render(
      <StrictMode>
        <WsdlWeb {...(config ?? {})} />
      </StrictMode>,
    )
  },
}

// Expose on the global window object
;(window as unknown as Record<string, unknown>).WsdlWeb = WsdlWebBundle

export default WsdlWebBundle
