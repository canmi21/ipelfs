import { onMounted } from 'vue'
import { useNotifications } from './useNotifications'
import { buildApiUrl } from './../config/api'

const LOCALSTORAGE_KEY_DISMISSED_BROWSER_WARNING = 'dismissedUnsupportedBrowserWarning'
const LOCALSTORAGE_KEY_DISMISSED_FIREFOX_WARNING = 'dismissedFirefoxAnimationWarning'

export function useBrowserCompatibility() {
  const { addNotification } = useNotifications()

  const runBrowserChecks = async () => {
    let dismissedBrowserWarning = false
    let dismissedFirefoxWarning = false
    let ua = '' // User-Agent, will be fetched from backend

    try {
      if (typeof localStorage !== 'undefined') {
        dismissedBrowserWarning =
          localStorage.getItem(LOCALSTORAGE_KEY_DISMISSED_BROWSER_WARNING) === 'true'
        dismissedFirefoxWarning =
          localStorage.getItem(LOCALSTORAGE_KEY_DISMISSED_FIREFOX_WARNING) === 'true'
      }
    } catch {
      // Silently catch error for localStorage access if it's critical for page load
      // Or consider a more robust error handling if localStorage is essential
    }

    try {
      const uaUrl = buildApiUrl('/v1/ipelfs/ua')
      const response = await fetch(uaUrl)
      if (!response.ok) {
        // Failed to fetch, do not proceed with UA-based checks
        return
      }
      const result = await response.json()
      if (
        result.success &&
        result.data &&
        typeof result.data.user_agent === 'string' &&
        result.data.user_agent.trim() !== ''
      ) {
        ua = result.data.user_agent.toLowerCase()
      } else {
        // Backend did not return a valid user_agent string
        return
      }
    } catch {
      // Error fetching User-Agent from backend
      return
    }

    // empty
    if (!ua) {
      return
    }

    const isEdge = ua.includes('edg/') || ua.includes('edge/')
    const isChrome =
      (ua.includes('chrome/') || ua.includes('crios/')) && !isEdge && !ua.includes('opr/')
    const isSafari =
      ua.includes('safari/') &&
      !ua.includes('chrome/') &&
      !ua.includes('crios/') &&
      !isEdge &&
      !ua.includes('opr/')
    const isFirefox = ua.includes('firefox/') || ua.includes('fxios/')

    const isGenerallySupported = isChrome || isEdge || isSafari

    if (!dismissedBrowserWarning && !isGenerallySupported && !isFirefox) {
      addNotification({
        message: 'Consider using a mainstream Chromium-based browser',
        type: 'warning', // Yellow
        duration: 5000,
        onManuallyDismissed: () => {
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(LOCALSTORAGE_KEY_DISMISSED_BROWSER_WARNING, 'true')
            }
          } catch {
            /* Suppress storage error on dismiss */
          }
        },
      })
    }

    if (!dismissedFirefoxWarning && isFirefox) {
      addNotification({
        message: 'Some animations might show slight inconsistencies on Firefox',
        type: 'info', // Green
        duration: 5000,
        onManuallyDismissed: () => {
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(LOCALSTORAGE_KEY_DISMISSED_FIREFOX_WARNING, 'true')
            }
          } catch {
            /* Suppress storage error on dismiss */
          }
        },
      })
    }
  }

  onMounted(() => {
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      runBrowserChecks()
    }
  })
}
