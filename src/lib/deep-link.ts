export interface DeepLinkTarget {
  service: string
  endpoint: string
  operation?: string
}

export interface DeepLinkState {
  url: string | null
  urls: string[]
  target: DeepLinkTarget | null
}

export function parseDeepLink(location: Location): DeepLinkState {
  const params = new URLSearchParams(location.search)
  const urls = params.getAll('url')
  const url = urls.length === 1 ? urls[0] : null

  const hash = location.hash.startsWith('#') ? location.hash.slice(1) : ''
  let target: DeepLinkTarget | null = null

  if (hash) {
    const segments = hash.split('/').map(decodeURIComponent)
    if (segments.length >= 2) {
      target = {
        service: segments[0],
        endpoint: segments[1],
        operation: segments.length >= 3 ? segments[2] : undefined,
      }
    }
  }

  return { url, urls: urls.length > 1 ? urls : [], target }
}

export function buildDeepLinkUrl(
  basePath: string,
  wsdlUrl: string,
  expandedOperations: Set<string>,
  expandedGroups: Set<string>,
): string {
  if (!wsdlUrl || !isRemoteUrl(wsdlUrl)) return basePath

  const search = `?url=${encodeURIComponent(wsdlUrl)}`
  const hash = buildHash(expandedOperations, expandedGroups)

  return `${basePath}${search}${hash}`
}

function buildHash(
  expandedOperations: Set<string>,
  expandedGroups: Set<string>,
): string {
  // Prefer the most specific expanded item
  for (const opKey of expandedOperations) {
    const parts = opKey.split('/')
    if (parts.length === 3) {
      return '#' + parts.map(encodeURIComponent).join('/')
    }
  }

  for (const groupKey of expandedGroups) {
    const parts = groupKey.split('/')
    if (parts.length === 2) {
      return '#' + parts.map(encodeURIComponent).join('/')
    }
  }

  return ''
}

export function isRemoteUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://')
}
