/**
 * A named WSDL entry for the spec switcher.
 */
export interface WsdlSpec {
  /** Display label shown in the switcher dropdown. */
  label: string
  /** The WSDL URL to load. */
  url: string
}

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
   * Multiple WSDL URLs for the spec switcher dropdown.
   * Each entry can be a plain URL string or a `{ label, url }` object.
   * When provided, a dropdown appears in the top bar to switch between WSDLs.
   */
  urls?: Array<string | WsdlSpec>

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

/** Resolved config with defaults applied and `urls` normalized. */
export interface ResolvedWsdlWebConfig {
  url: string
  urls: WsdlSpec[]
  showUrlInput: boolean
  showExploreButton: boolean
  showBrowseButton: boolean
  baseUrlOverride: string
}

export const defaultConfig: ResolvedWsdlWebConfig = {
  url: '',
  urls: [],
  showUrlInput: true,
  showExploreButton: true,
  showBrowseButton: true,
  baseUrlOverride: '',
}

/** Derive a display label from a URL (hostname + pathname tail). */
function labelFromUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const path = parsed.pathname.replace(/\/$/, '')
    const tail = path.split('/').filter(Boolean).pop() ?? ''
    return tail ? `${parsed.hostname}/${tail}` : parsed.hostname
  } catch {
    return url
  }
}

/** Normalize a user-supplied entry to a `WsdlSpec`. */
function normalizeSpec(entry: string | WsdlSpec): WsdlSpec {
  if (typeof entry === 'string') {
    return { label: labelFromUrl(entry), url: entry }
  }
  return entry
}

export function resolveConfig(config?: Partial<WsdlWebConfig>): ResolvedWsdlWebConfig {
  const resolved: ResolvedWsdlWebConfig = {
    url: config?.url ?? defaultConfig.url,
    urls: (config?.urls ?? []).map(normalizeSpec),
    showUrlInput: config?.showUrlInput ?? defaultConfig.showUrlInput,
    showExploreButton: config?.showExploreButton ?? defaultConfig.showExploreButton,
    showBrowseButton: config?.showBrowseButton ?? defaultConfig.showBrowseButton,
    baseUrlOverride: config?.baseUrlOverride ?? defaultConfig.baseUrlOverride,
  }
  return resolved
}
