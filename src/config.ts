/**
 * Configuration options for the embeddable WsdlWeb component.
 *
 * These options work identically whether you use the prebuilt dist bundle
 * (`WsdlWeb.init()`) or the React component (`<WsdlWeb />`).
 */
export interface WsdlWebConfig {
  /** WSDL URL to load automatically on startup. */
  url?: string

  /**
   * Show the URL text input in the top bar.
   * @default true
   */
  showUrlInput?: boolean

  /**
   * Show the "Explore" button next to the URL input.
   * @default true
   */
  showExploreButton?: boolean

  /**
   * Show the "Browse" button for loading local WSDL files.
   * @default true
   */
  showBrowseButton?: boolean

  /**
   * Override the base URL used for all SOAP endpoint addresses.
   * Useful when requests should be routed through a proxy.
   */
  baseUrlOverride?: string
}

export const defaultConfig: Required<WsdlWebConfig> = {
  url: '',
  showUrlInput: true,
  showExploreButton: true,
  showBrowseButton: true,
  baseUrlOverride: '',
}

export function resolveConfig(config?: Partial<WsdlWebConfig>): Required<WsdlWebConfig> {
  return { ...defaultConfig, ...config }
}
