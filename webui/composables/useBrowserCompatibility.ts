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
    let ua = '' // User-Agent

    try {
      if (typeof localStorage !== 'undefined') {
        dismissedBrowserWarning =
          localStorage.getItem(LOCALSTORAGE_KEY_DISMISSED_BROWSER_WARNING) === 'true'
        dismissedFirefoxWarning =
          localStorage.getItem(LOCALSTORAGE_KEY_DISMISSED_FIREFOX_WARNING) === 'true'
      } else {
        console.warn(
          'localStorage is not available. Browser compatibility notifications cannot be persistently dismissed.',
        )
      }
    } catch (e) {
      console.warn('Error accessing localStorage for browser compatibility checks:', e)
    }

    try {
      const uaUrl = buildApiUrl('/v1/ipelfs/ua')
      const response = await fetch(uaUrl)
      if (!response.ok) {
        throw new Error(
          `Failed to fetch UA from backend: ${response.status} ${response.statusText}`,
        )
      }
      const result = await response.json()
      if (result.success && result.data && typeof result.data.user_agent === 'string') {
        ua = result.data.user_agent.toLowerCase()
      } else {
        if (typeof navigator !== 'undefined' && navigator.userAgent) {
          ua = navigator.userAgent.toLowerCase()
        } else {
          return
        }
      }
    } catch {
      if (typeof navigator !== 'undefined' && navigator.userAgent) {
        ua = navigator.userAgent.toLowerCase()
        addNotification({
          message: 'Could not verify your browser via backend.',
          type: 'warning',
          duration: 3500,
        })
      } else {
        return
      }
    }

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

    // --- ORIGINAL LOGIC with added console logs ---
    if (!dismissedBrowserWarning && !isGenerallySupported && !isFirefox) {
      //console.log('[BrowserCompat] Triggering non-recommended browser warning for real.')
      addNotification({
        message: 'Consider using a modern browser like Chrome, Edge, or Safari.',
        type: 'warning',
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
        message: 'Some animations might show slight inconsistencies on Firefox.',
        type: 'info',
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
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      runBrowserChecks()
    }
  })
}
