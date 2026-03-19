import { useEffect, useRef } from 'react'
import { useWsdlStore } from '@/store/wsdl-store'
import { parseDeepLink, buildDeepLinkUrl, isRemoteUrl } from '@/lib/deep-link'
import type { DeepLinkTarget } from '@/lib/deep-link'

export function useDeepLink(): void {
  const pendingTargetRef = useRef<DeepLinkTarget | null>(null)
  const isUpdatingFromUrlRef = useRef(false)
  const hasInitializedRef = useRef(false)

  const {
    wsdlUrl,
    isLoading,
    error,
    operations,
    expandedGroups,
    expandedOperations,
    loadWsdl,
    expandGroup,
    expandOperation,
    setWsdlSpecs,
    switchSpec,
  } = useWsdlStore()

  // URL → State: on mount, parse URL and trigger load
  useEffect(() => {
    if (hasInitializedRef.current) return
    hasInitializedRef.current = true

    const { url, urls, target } = parseDeepLink(window.location)

    // Multiple WSDLs from query string: ?url=a&url=b
    if (urls.length > 0) {
      const specs = urls.map((u) => {
        try {
          const parsed = new URL(u)
          const path = parsed.pathname.replace(/\/$/, '')
          const tail = path.split('/').filter(Boolean).pop() ?? ''
          const label = tail ? `${parsed.hostname}/${tail}` : parsed.hostname
          return { label, url: u }
        } catch {
          return { label: u, url: u }
        }
      })
      isUpdatingFromUrlRef.current = true
      pendingTargetRef.current = target
      setWsdlSpecs(specs)
      switchSpec(0)
      return
    }

    if (!url) return

    isUpdatingFromUrlRef.current = true
    pendingTargetRef.current = target
    loadWsdl(url)
  }, [loadWsdl, setWsdlSpecs, switchSpec])

  // After WSDL loads, expand pending target
  useEffect(() => {
    if (isLoading || operations.length === 0 || !pendingTargetRef.current) return

    const target = pendingTargetRef.current
    pendingTargetRef.current = null
    isUpdatingFromUrlRef.current = true

    const groupKey = `${target.service}/${target.endpoint}`
    expandGroup(groupKey)

    if (target.operation) {
      const opKey = `${target.service}/${target.endpoint}/${target.operation}`
      expandOperation(opKey)
    }
  }, [isLoading, operations, expandGroup, expandOperation])

  // Clear pending target on error
  useEffect(() => {
    if (error) {
      pendingTargetRef.current = null
    }
  }, [error])

  // State → URL: sync outward on state changes
  useEffect(() => {
    if (isUpdatingFromUrlRef.current) {
      isUpdatingFromUrlRef.current = false
      return
    }

    if (!wsdlUrl || !isRemoteUrl(wsdlUrl)) return

    const newUrl = buildDeepLinkUrl(
      window.location.pathname,
      wsdlUrl,
      expandedOperations,
      expandedGroups,
    )
    if (newUrl !== window.location.pathname + window.location.search + window.location.hash) {
      history.replaceState(null, '', newUrl)
    }
  }, [wsdlUrl, expandedGroups, expandedOperations])

  // Back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const { url, target } = parseDeepLink(window.location)
      if (!url) return

      isUpdatingFromUrlRef.current = true
      const currentUrl = useWsdlStore.getState().wsdlUrl

      if (url !== currentUrl) {
        pendingTargetRef.current = target
        loadWsdl(url)
      } else if (target) {
        const groupKey = `${target.service}/${target.endpoint}`
        expandGroup(groupKey)
        if (target.operation) {
          expandOperation(`${groupKey}/${target.operation}`)
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [loadWsdl, expandGroup, expandOperation])
}
