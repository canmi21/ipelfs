<script setup lang="ts">
import { useDark } from '@vueuse/core'
import { ref, watchEffect, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  Sun,
  Moon,
  SunMoon,
  PanelRightOpen,
  PanelRightClose,
  SquareArrowOutUpRight,
  Server,
  ServerOff,
  RotateCcw,
  ExternalLink,
  X as IconX,
  DatabaseZap,
  FileClock,
  FileJson2, // Assuming this was a planned import for the JS error, if not it can be removed
} from 'lucide-vue-next'

// --- Theme Initialization ---
const storedTheme = localStorage.getItem('theme')
const isDark = useDark({
  valueDark: 'dark',
  valueLight: '', // For light mode, we'll remove the 'dark' class
  storageKey: null, // We handle storage manually to support 'system'
  initialValue: (() => {
    if (storedTheme === 'dark') return 'dark'
    if (storedTheme === 'light') return 'light'
    // If no theme is stored, try to use system preference
    try {
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return systemIsDark ? 'dark' : 'light'
    } catch (e) {
      console.error('Failed to detect system color scheme:', e)
      // Default to dark if system detection fails and no theme is stored
      localStorage.setItem('theme', 'dark')
      return 'dark'
    }
  })(),
})

const currentIcon = ref<'sun' | 'moon' | 'sun-moon'>(
  storedTheme === 'dark' ? 'moon' : storedTheme === 'light' ? 'sun' : 'sun-moon',
)
const currentTheme = ref<'light' | 'dark' | 'system'>(
  storedTheme === 'dark' ? 'dark' : storedTheme === 'light' ? 'light' : 'system',
)

// Toggles theme: Light -> System (or Dark if system is Dark) -> Dark -> Light
const handleToggle = () => {
  if (currentTheme.value === 'light') {
    // Transitioning from Light
    try {
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (!systemIsDark) {
        // System is Light, so next logical step is Dark (skip system if it's same as current light)
        currentIcon.value = 'moon'
        currentTheme.value = 'dark'
        isDark.value = true
        localStorage.setItem('theme', 'dark')
      } else {
        // System is Dark, so go to System preference
        currentIcon.value = 'sun-moon'
        currentTheme.value = 'system'
        isDark.value = systemIsDark // Reflect system preference
        localStorage.removeItem('theme') // System means no explicit override
      }
    } catch (e) {
      // Fallback if system preference check fails
      console.error('Failed to switch theme based on system preference:', e)
      currentIcon.value = 'moon'
      currentTheme.value = 'dark'
      isDark.value = true
      localStorage.setItem('theme', 'dark')
    }
  } else if (currentTheme.value === 'system') {
    // Transitioning from System, always go to Dark next
    currentIcon.value = 'moon'
    currentTheme.value = 'dark'
    isDark.value = true
    localStorage.setItem('theme', 'dark')
  } else {
    // Current theme is 'dark', transition to Light
    currentIcon.value = 'sun'
    currentTheme.value = 'light'
    isDark.value = false
    localStorage.setItem('theme', 'light')
  }
}

// Apply 'dark' class to HTML element based on isDark state
watchEffect(() => {
  document.documentElement.classList.toggle('dark', isDark.value)
})

// --- Sidebar Animation State & Logic ---
const getInitialSidebarState = (): boolean => {
  const storedState = localStorage.getItem('sidebarCollapsed')
  if (storedState !== null) {
    try {
      return JSON.parse(storedState)
    } catch (e) {
      console.error(
        'Failed to parse sidebarCollapsed from localStorage. Defaulting to expanded.',
        e,
      )
      return false // Default to expanded if parsing fails
    }
  }
  return false // Default to expanded
}

const isSidebarCollapsed = ref(getInitialSidebarState())
const showSidebarText = ref(!isSidebarCollapsed.value) // Text visibility driven by collapsed state
const showGithubIcon = ref(!isSidebarCollapsed.value) // GitHub icon visibility
const showInlineStatusText = ref(!isSidebarCollapsed.value) // Status text visibility
const sidebarWidthClass = ref(isSidebarCollapsed.value ? 'w-14' : 'w-56') // Dynamic sidebar width
const contentMarginClass = ref(isSidebarCollapsed.value ? 'ml-14' : 'ml-56') // Dynamic content margin (note: ml-56 matches w-56)
const isAnimating = ref(false) // Flag to prevent re-triggering animation
const githubIconCollapseTimer = ref<number | undefined>(undefined)
const githubIconExpandTimer = ref<number | undefined>(undefined)
const statusTextExpandTimer = ref<number | undefined>(undefined)
const mainContentEl = ref<HTMLElement | null>(null)

// Persist sidebar state to localStorage
watchEffect(() => {
  localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed.value))
})

// --- Backend Connection State & Dynamic Health Check ---
const isBackendConnected = ref(true) // Assume connected initially
const latencyMs = ref<number | null>(null)
const healthCheckTimerId = ref<number | undefined>(undefined)
const currentHealthCheckIntervalMs = ref(1000) // Initial health check interval
const offlineStartTime = ref<number | null>(null) // Timestamp when backend went offline
const isRetryingManualCheck = ref(false) // State for manual retry button
const manualRetryButtonTimeoutId = ref<number | undefined>(undefined) // Timer for retry button failure state
const triggerShake = ref(false) // For retry button shake animation
const showRetryFailureIcon = ref(false) // Show X icon on retry button after failure

// --- JavaScript Error State (for in-app JS failures) ---
const showJavascriptErrorOverlay = ref(false) // Controls visibility of JS error overlay
const jsErrorHelpLink = 'https://www.enable-javascript.com/' // Link for JS help

// Utility function to truncate numbers
function truncate(num: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces)
  return Math.floor(num * factor) / factor
}

// Computed property to format latency for display
const formattedLatency = computed(() => {
  const ms = latencyMs.value
  if (ms === null || ms < 0) return null // Not yet calculated or invalid
  if (ms === 0) return '0ms'

  const ns = ms * 1_000_000
  if (ms > 0 && ms < 0.001) return `${Math.floor(ns)}ns` // Nanoseconds for very low latency

  if (ms < 1000) {
    // Milliseconds
    if (ms < 10) return `${truncate(ms, 2).toFixed(2)}ms`
    if (ms < 100) return `${truncate(ms, 1).toFixed(1)}ms`
    return `${Math.floor(ms)}ms`
  } else {
    // Seconds
    const s = ms / 1000
    if (s < 10) return `${truncate(s, 2).toFixed(2)}s`
    if (s < 100) return `${truncate(s, 1).toFixed(1)}s`
    return `${Math.floor(s)}s`
  }
})

// Async function to check backend health
const checkBackendStatus = async () => {
  const requestSentTimestamp = Date.now()
  try {
    const response = await fetch('http://localhost:33330/v1/ipelfs/healthcheck')
    if (response.ok) {
      const data = await response.json()
      if (data.success === true) {
        isBackendConnected.value = true
        try {
          // Precise latency calculation using backend timestamp
          const backendTimestampStr = data.data as string
          const datePart = backendTimestampStr.substring(0, 19)
          const fractionalPartMatch = backendTimestampStr.match(/\.(\d+)/)
          let timezonePart = 'Z' // Assume UTC if not specified
          const timezoneMatch = backendTimestampStr.substring(19).match(/[Z+-].*$/)
          if (timezoneMatch) timezonePart = timezoneMatch[0]

          let backendEpochNs: bigint
          const baseMsBigInt = BigInt(new Date(datePart + timezonePart).getTime())

          if (fractionalPartMatch && fractionalPartMatch[1]) {
            const nanoStr = fractionalPartMatch[1].padEnd(9, '0').substring(0, 9) // Pad to 9 digits for nanoseconds
            backendEpochNs = baseMsBigInt * 1_000_000n + BigInt(nanoStr)
          } else {
            backendEpochNs = baseMsBigInt * 1_000_000n
          }
          const requestSentEpochNs = BigInt(requestSentTimestamp) * 1_000_000n
          latencyMs.value = Number(backendEpochNs - requestSentEpochNs) / 1_000_000.0
        } catch (e) {
          console.error('Error parsing backend timestamp or calculating latency:', e)
          latencyMs.value = -1 // Indicate error in latency calculation
        }
      } else {
        isBackendConnected.value = false
        latencyMs.value = null
      }
    } else {
      console.warn(`Health check received non-ok status: ${response.status}`)
      isBackendConnected.value = false
      latencyMs.value = null
    }
  } catch (error) {
    console.error('Health check request failed:', error)
    isBackendConnected.value = false
    latencyMs.value = null
  }
}

// Performs health check and schedules the next one with exponential backoff
const performHealthCheckAndScheduleNext = async () => {
  if (healthCheckTimerId.value !== undefined) {
    clearTimeout(healthCheckTimerId.value) // Clear existing timer
  }
  await checkBackendStatus()

  if (isBackendConnected.value) {
    currentHealthCheckIntervalMs.value = 1000 // Reset to normal interval if connected
    offlineStartTime.value = null
    if (isRetryingManualCheck.value) {
      // Reset manual retry state if connection is restored
      isRetryingManualCheck.value = false
      showRetryFailureIcon.value = false
      if (manualRetryButtonTimeoutId.value !== undefined) {
        clearTimeout(manualRetryButtonTimeoutId.value)
        manualRetryButtonTimeoutId.value = undefined
      }
    }
  } else {
    if (offlineStartTime.value === null) {
      offlineStartTime.value = Date.now() // Record when disconnection started
    }
    // Exponential backoff for health checks when offline
    const minutesOffline = Math.max(
      0,
      Math.floor((Date.now() - (offlineStartTime.value || Date.now())) / (1000 * 60)),
    )
    currentHealthCheckIntervalMs.value = 5000 * Math.pow(2, Math.min(minutesOffline, 6)) // Cap backoff multiplier
  }
  healthCheckTimerId.value = window.setTimeout(
    // Schedule next health check
    performHealthCheckAndScheduleNext,
    currentHealthCheckIntervalMs.value,
  )
}

// Triggers a manual health check attempt
const triggerManualHealthCheck = async () => {
  if (isRetryingManualCheck.value || showRetryFailureIcon.value) return // Prevent multiple retries

  isRetryingManualCheck.value = true
  triggerShake.value = false // Reset shake animation
  showRetryFailureIcon.value = false // Hide failure icon

  // Clear existing timers
  if (healthCheckTimerId.value !== undefined) clearTimeout(healthCheckTimerId.value)
  if (manualRetryButtonTimeoutId.value !== undefined) clearTimeout(manualRetryButtonTimeoutId.value)

  // Set a timeout for the retry attempt
  manualRetryButtonTimeoutId.value = window.setTimeout(() => {
    if (!isBackendConnected.value) {
      // If still not connected after timeout
      isRetryingManualCheck.value = false
      showRetryFailureIcon.value = true
      triggerShake.value = true // Trigger shake animation
      setTimeout(() => {
        // Hide shake animation after a bit
        triggerShake.value = false
        setTimeout(() => {
          // Hide failure icon after a bit more
          showRetryFailureIcon.value = false
        }, 700)
      }, 300)
    }
  }, 3000) // 3-second timeout for manual retry feedback

  await performHealthCheckAndScheduleNext() // Perform the health check
}

// Opens a URL in a new tab
const openExternalLink = (url: string) => {
  window.open(url, '_blank', 'noopener noreferrer')
}

// Reloads the current page
const refreshPage = () => {
  window.location.reload()
}

// Component mounted lifecycle hook
onMounted(() => {
  // Initial health check
  checkBackendStatus().then(() => {
    if (isBackendConnected.value) {
      currentHealthCheckIntervalMs.value = 1000
      offlineStartTime.value = null
    } else {
      offlineStartTime.value = Date.now()
      const minutesOffline = 0 // Start with 0 minutes offline for initial backoff calculation
      currentHealthCheckIntervalMs.value = 5000 * Math.pow(2, minutesOffline)
    }
    // Schedule the first periodic health check
    healthCheckTimerId.value = window.setTimeout(
      performHealthCheckAndScheduleNext,
      currentHealthCheckIntervalMs.value,
    )
  })

  // Check if JavaScript is enabled (simple check)
  if (typeof window.addEventListener === 'undefined') {
    showJavascriptErrorOverlay.value = true
  }
})

// Component unmounted lifecycle hook
onUnmounted(() => {
  // Clear all timers to prevent memory leaks
  if (healthCheckTimerId.value !== undefined) clearTimeout(healthCheckTimerId.value)
  if (manualRetryButtonTimeoutId.value !== undefined) clearTimeout(manualRetryButtonTimeoutId.value)
  if (githubIconCollapseTimer.value !== undefined) clearTimeout(githubIconCollapseTimer.value)
  if (githubIconExpandTimer.value !== undefined) clearTimeout(githubIconExpandTimer.value)
  if (statusTextExpandTimer.value !== undefined) clearTimeout(statusTextExpandTimer.value)
})

// Handles sidebar toggle animation and state changes
const handleSidebarToggle = () => {
  if (isAnimating.value) return // Prevent animation spam
  isAnimating.value = true

  // Clear any pending timers for icon/text visibility
  if (githubIconCollapseTimer.value !== undefined) clearTimeout(githubIconCollapseTimer.value)
  if (githubIconExpandTimer.value !== undefined) clearTimeout(githubIconExpandTimer.value)
  if (statusTextExpandTimer.value !== undefined) clearTimeout(statusTextExpandTimer.value)
  githubIconCollapseTimer.value = undefined
  githubIconExpandTimer.value = undefined
  statusTextExpandTimer.value = undefined

  const currentlyCollapsed = isSidebarCollapsed.value
  const animationDuration = 300 // Standard animation duration
  const expandShowEarlyMs = 50 // How early to show text/icons during expand

  if (!currentlyCollapsed) {
    // --- Intent: COLLAPSE ---
    isSidebarCollapsed.value = true
    showGithubIcon.value = false // Hide GitHub icon immediately (or with slight delay if preferred)
    showInlineStatusText.value = false // Hide status text immediately

    // Delay hiding general sidebar text to allow for smoother visual transition
    const generalTextHideDelay = Math.max(50, animationDuration - 150)
    setTimeout(() => {
      if (isSidebarCollapsed.value) showSidebarText.value = false
    }, generalTextHideDelay)

    // Change content margin after initiating sidebar width change for smoother visual
    nextTick(() => {
      contentMarginClass.value = 'ml-14' // New margin for collapsed state
      sidebarWidthClass.value = 'w-14' // Trigger width transition to collapsed
    })

    const onCollapseAnimationEnd = () => {
      isAnimating.value = false
    }
    // Use transitionend event on main content for reliable animation end detection
    if (mainContentEl.value) {
      mainContentEl.value.addEventListener('transitionend', onCollapseAnimationEnd, { once: true })
    } else {
      setTimeout(onCollapseAnimationEnd, animationDuration + 50) // Fallback timer
    }
  } else {
    // --- Intent: EXPAND ---
    isSidebarCollapsed.value = false
    sidebarWidthClass.value = 'w-56' // Trigger width transition to expanded

    nextTick(() => {
      contentMarginClass.value = 'ml-56' // New margin for expanded state (matches new w-56)

      // Schedule text and icons to appear slightly before animation completes
      setTimeout(
        () => {
          if (!isSidebarCollapsed.value) showSidebarText.value = true
        },
        Math.max(0, animationDuration - expandShowEarlyMs - 50),
      ) // Show main text a bit earlier

      const showIconTime = Math.max(0, animationDuration - expandShowEarlyMs)
      githubIconExpandTimer.value = window.setTimeout(() => {
        if (!isSidebarCollapsed.value) showGithubIcon.value = true
      }, showIconTime)

      const showStatusTextTime = Math.max(0, animationDuration - expandShowEarlyMs + 20) // Slightly later for status
      statusTextExpandTimer.value = window.setTimeout(() => {
        if (!isSidebarCollapsed.value) showInlineStatusText.value = true
      }, showStatusTextTime)
    })

    const onExpandAnimationEnd = () => {
      // Ensure all elements are visible if they should be
      if (!isSidebarCollapsed.value) {
        if (!showGithubIcon.value) showGithubIcon.value = true
        if (!showInlineStatusText.value) showInlineStatusText.value = true
        if (!showSidebarText.value) showSidebarText.value = true
      }
      isAnimating.value = false
    }
    // Use transitionend event on main content
    if (mainContentEl.value) {
      mainContentEl.value.addEventListener('transitionend', onExpandAnimationEnd, { once: true })
    } else {
      setTimeout(onExpandAnimationEnd, animationDuration + 50) // Fallback timer
    }
  }
}

const openRepositoryIssuesPage = () => {
  openExternalLink('https://github.com/canmi21/ipelfs/issues')
}
</script>

<template>
  <div class="relative min-h-screen" style="background-color: var(--bg); color: var(--text-main)">
    <div
      :class="sidebarWidthClass"
      class="fixed top-0 left-0 h-full bg-gray-100 dark:bg-gray-850 z-30 transition-all ease-in-out duration-300 overflow-hidden flex flex-col"
    >
      <div class="flex items-center justify-between p-2 pr-3 mt-0.5 mb-1 shrink-0">
        <div
          @click="handleSidebarToggle"
          class="cursor-pointer p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-750 group"
          title="Toggle Sidebar"
        >
          <component
            :is="isSidebarCollapsed ? PanelRightClose : PanelRightOpen"
            class="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-[#1C9376] transition-colors duration-150"
          />
        </div>
        <div
          v-show="showGithubIcon && !isSidebarCollapsed"
          class="cursor-pointer p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-750 group"
          title="Open GitHub Repository"
          @click="openExternalLink('https://github.com/canmi21/ipelfs')"
        >
          <SquareArrowOutUpRight
            class="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-[#1C9376] transition-colors duration-150"
          />
        </div>
      </div>

      <nav class="flex-grow px-2">
        <ul class="space-y-1">
          <li
            class="cursor-pointer group rounded-md transition-colors duration-150"
            :class="{
              'hover:bg-gray-200 dark:hover:bg-gray-750': showSidebarText,
              'justify-center': isSidebarCollapsed,
            }"
          >
            <div class="flex items-center h-10 px-2">
              <Server
                class="w-6 h-6 flex-shrink-0 text-gray-500 dark:text-gray-400 transition-colors duration-150"
                :class="{
                  'group-hover:text-[#1C9376]': showSidebarText,
                  'icon-hover-effect-standalone': isSidebarCollapsed,
                }"
              />
              <span
                v-if="showSidebarText"
                class="ml-3 text-base font-medium text-sidebar-main dark:text-sidebar-dark-main group-hover:text-[#1C9376] transition-colors duration-150 truncate"
              >
                Volumes
              </span>
            </div>
          </li>
          <li
            class="cursor-pointer group rounded-md transition-colors duration-150"
            :class="{
              'hover:bg-gray-200 dark:hover:bg-gray-750': showSidebarText,
              'justify-center': isSidebarCollapsed,
            }"
          >
            <div class="flex items-center h-10 px-2">
              <DatabaseZap
                class="w-6 h-6 flex-shrink-0 text-gray-500 dark:text-gray-400 transition-colors duration-150"
                :class="{
                  'group-hover:text-[#1C9376]': showSidebarText,
                  'icon-hover-effect-standalone': isSidebarCollapsed,
                }"
              />
              <span
                v-if="showSidebarText"
                class="ml-3 text-base font-medium text-sidebar-main dark:text-sidebar-dark-main group-hover:text-[#1C9376] transition-colors duration-150 truncate"
              >
                Collections
              </span>
            </div>
          </li>
          <li
            class="cursor-pointer group rounded-md transition-colors duration-150"
            :class="{
              'hover:bg-gray-200 dark:hover:bg-gray-750': showSidebarText,
              'justify-center': isSidebarCollapsed,
            }"
          >
            <div class="flex items-center h-10 px-2">
              <FileClock
                class="w-6 h-6 flex-shrink-0 text-gray-500 dark:text-gray-400 transition-colors duration-150"
                :class="{
                  'group-hover:text-[#1C9376]': showSidebarText,
                  'icon-hover-effect-standalone': isSidebarCollapsed,
                }"
              />
              <span
                v-if="showSidebarText"
                class="ml-3 text-base font-medium text-sidebar-main dark:text-sidebar-dark-main group-hover:text-[#1C9376] transition-colors duration-150 truncate"
              >
                Activity
              </span>
            </div>
          </li>
        </ul>
      </nav>

      <div class="fixed-status-item-container p-2 mt-auto shrink-0">
        <div
          class="flex items-center h-10 px-2 rounded-md cursor-default group"
          :class="{
            'hover:bg-gray-200 dark:hover:bg-gray-750': showInlineStatusText || isSidebarCollapsed,
            'justify-center': isSidebarCollapsed,
          }"
        >
          <component
            :is="isBackendConnected ? Server : ServerOff"
            class="w-6 h-6 flex-shrink-0 transition-colors duration-150"
            :class="{
              'text-status-connected dark:text-status-dark-connected': isBackendConnected,
              'text-status-disconnected dark:text-status-dark-disconnected': !isBackendConnected,
              'group-hover:text-status-connected-hover dark:group-hover:text-status-dark-connected-hover':
                isBackendConnected && (showInlineStatusText || isSidebarCollapsed),
              'icon-hover-effect-standalone': isSidebarCollapsed && !showInlineStatusText,
            }"
          />
          <div
            v-if="showInlineStatusText && !isSidebarCollapsed"
            class="status-text-wrapper ml-3 flex-grow min-w-0 flex justify-center items-center"
          >
            <div v-if="!isBackendConnected" class="flex items-center">
              <span class="status-orb orb-disconnected mr-1.5 flex-shrink-0"></span>
              <span
                class="font-medium text-sm truncate text-status-disconnected dark:text-status-dark-disconnected"
                >Disconnected</span
              >
            </div>
            <div v-if="isBackendConnected" class="flex flex-col items-center">
              <div class="flex items-center">
                <span class="status-orb orb-connected mr-1.5 flex-shrink-0"></span>
                <span class="status-connected-text">Connected</span>
              </div>
              <div class="text-center -mt-1">
                <span v-if="formattedLatency" class="status-latency-display-text"
                  >Latency: {{ formattedLatency }}</span
                >
                <span
                  v-else-if="latencyMs === null && healthCheckTimerId !== undefined"
                  class="status-latency-display-text"
                  >Calculating...</span
                >
                <span
                  v-else-if="latencyMs === -1"
                  class="status-latency-display-text text-red-500 dark:text-red-400"
                  >Error</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="absolute top-4 right-4 z-40 cursor-pointer p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-750 group"
      @click="handleToggle"
      title="Toggle Theme"
    >
      <component
        :is="currentIcon === 'sun' ? Sun : currentIcon === 'moon' ? Moon : SunMoon"
        class="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-[#1C9376] transition-colors duration-150"
      />
    </div>

    <div
      ref="mainContentEl"
      :class="contentMarginClass"
      class="relative z-20 transition-margin ease-in-out duration-300 flex items-center justify-center min-h-screen"
      style="background-color: var(--bg-main-content)"
    >
      <div class="text-xl text-center text-text-main dark:text-text-dark-main">Hello, World!</div>
    </div>

    <Transition name="overlay-fade">
      <div
        v-if="!isBackendConnected && !showJavascriptErrorOverlay"
        class="fixed inset-0 z-[9998] bg-gray-900 bg-opacity-40 dark:bg-black dark:bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4"
        aria-modal="true"
        role="dialog"
      >
        <Transition name="modal-pop" appear>
          <div
            class="modal-card-content bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg relative"
          >
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center">
                <ServerOff class="w-8 h-8 text-red-500 dark:text-red-400 mr-3 flex-shrink-0" />
                <h2 class="text-xl sm:text-2xl font-semibold text-red-600 dark:text-red-400">
                  Connection Lost
                </h2>
              </div>
              <button
                @click="openRepositoryIssuesPage"
                class="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full transition-transform duration-200 ease-out hover:scale-110 group"
                title="Open GitHub Issues"
                aria-label="Open GitHub Issues for help"
              >
                <ExternalLink
                  class="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors"
                />
              </button>
            </div>

            <div class="flex items-center mb-5 text-gray-700 dark:text-gray-300">
              <strong class="text-sm sm:text-base">WebUI is currently unavailable.</strong>
            </div>

            <ul class="space-y-2.5 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              <li class="flex items-start">
                <span class="mr-2 text-red-500 dark:text-red-400 flex-shrink-0">&rarr;</span>
                <span
                  >Ensure the <strong>ipelfs service</strong> is running on your backend
                  server.</span
                >
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-red-500 dark:text-red-400 flex-shrink-0">&rarr;</span>
                <span
                  >Verify that this device and the backend server are on the
                  <strong>same network</strong>.</span
                >
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-red-500 dark:text-red-400 flex-shrink-0">&rarr;</span>
                <span
                  >Check your <strong>firewall settings</strong> to ensure port
                  <code>33330</code> is open.</span
                >
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-red-500 dark:text-red-400 flex-shrink-0">&rarr;</span>
                <span
                  >Confirm the backend URL (e.g., <code>http://localhost:33330</code>) is
                  correct.</span
                >
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-red-500 dark:text-red-400 flex-shrink-0">&rarr;</span>
                <span
                  >Inspect browser <strong>developer console</strong> and backend logs for
                  errors.</span
                >
              </li>
            </ul>

            <button
              @click="triggerManualHealthCheck"
              :disabled="isRetryingManualCheck || showRetryFailureIcon"
              class="mt-6 w-full font-semibold py-2.5 px-4 rounded-lg transition-all duration-150 ease-in-out flex items-center justify-center text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              :class="[
                isRetryingManualCheck
                  ? 'bg-gray-400 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed' // Muted retrying state
                  : showRetryFailureIcon
                    ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white focus:ring-red-500' // Failure state
                    : 'bg-[#1B9E7D] hover:bg-[#168266] dark:bg-[#1B9E7D] dark:hover:bg-[#168266] text-white active:bg-[#116650] dark:active:bg-[#116650] focus:ring-[#168266]', // Default state
                { 'animate-shake': triggerShake },
              ]"
            >
              <template v-if="showRetryFailureIcon">
                <IconX class="w-5 h-5 mr-0 sm:mr-2" />
                <span class="hidden sm:inline">Failed to Connect</span>
              </template>
              <template v-else>
                <RotateCcw
                  class="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                  :class="{ 'animate-spin': isRetryingManualCheck }"
                />
                <span>{{ isRetryingManualCheck ? 'Retrying...' : 'Retry Connection' }}</span>
              </template>
            </button>
          </div>
        </Transition>
      </div>
    </Transition>

    <Transition name="overlay-fade">
      <div
        v-if="showJavascriptErrorOverlay"
        class="fixed inset-0 z-[9999] bg-gray-900 bg-opacity-40 dark:bg-black dark:bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4"
        aria-modal="true"
        role="dialog"
      >
        <Transition name="modal-pop" appear>
          <div
            class="modal-card-content bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg relative"
          >
            <div class="flex justify-between items-center mb-4">
              <div class="flex items-center">
                <FileJson2
                  class="w-7 h-7 text-orange-500 dark:text-orange-400 mr-3 flex-shrink-0"
                />
                <h2 class="text-xl sm:text-2xl font-semibold text-orange-600 dark:text-orange-400">
                  JavaScript Issue
                </h2>
              </div>
              <button
                @click="openExternalLink(jsErrorHelpLink)"
                class="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full transition-transform duration-200 ease-out hover:scale-110 group"
                title="Why is JavaScript needed?"
                aria-label="Why is JavaScript needed?"
              >
                <ExternalLink
                  class="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors"
                />
              </button>
            </div>

            <div class="flex items-center mb-5 text-gray-700 dark:text-gray-300">
              <strong class="text-sm sm:text-base"
                >The WebUI requires JavaScript to function.</strong
              >
            </div>

            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3">
              JavaScript is essential for:
            </p>
            <ul class="space-y-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              <li class="flex items-start">
                <span class="mr-2 text-orange-500 dark:text-orange-400 flex-shrink-0">&rarr;</span>
                <span>Interactive UI elements and smooth animations.</span>
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-orange-500 dark:text-orange-400 flex-shrink-0">&rarr;</span>
                <span>Backend communication (fetching/sending data) for live updates.</span>
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-orange-500 dark:text-orange-400 flex-shrink-0">&rarr;</span>
                <span>Dynamic content rendering and page interactions.</span>
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-orange-500 dark:text-orange-400 flex-shrink-0">&rarr;</span>
                <span>Ensuring the overall application logic functions correctly.</span>
              </li>
            </ul>
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-4">
              Please enable JavaScript in your browser settings and refresh the page.
            </p>

            <button
              @click="refreshPage"
              class="mt-6 w-full bg-[#1B9E7D] hover:bg-[#168266] dark:bg-[#1B9E7D] dark:hover:bg-[#168266] text-white active:bg-[#116650] dark:active:bg-[#116650] focus:ring-[#168266] font-semibold py-2.5 px-4 rounded-lg transition-colors duration-150 ease-in-out flex items-center justify-center text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              <RotateCcw class="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Refresh Page
            </button>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style>
:root {
  /* Base background and text for the main content area */
  --bg-main-content: #ffffff; /* Light mode main background */
  --text-main: #1f2937; /* Tailwind gray-800 for light mode text */

  /* Sidebar specific text colors - Light Mode */
  --sidebar-text-main-συγκεκριμένα: #1f2937; /* Tailwind gray-800 */
  --sidebar-text-muted-συγκεκριμένα: #6b7280; /* Tailwind gray-500 */

  /* Status specific colors - Light Mode */
  --status-connected-color: #1c9376; /* Your specified green */
  --status-connected-orb-glow-start: rgba(28, 147, 118, 0.3);
  --status-connected-orb-glow-end: rgba(28, 147, 118, 0.6);
  --status-disconnected-color: #ef4444; /* Tailwind red-500 */
  --status-disconnected-orb-glow-start: rgba(239, 68, 68, 0.3);
  --status-disconnected-orb-glow-end: rgba(239, 68, 68, 0.6);

  /* Sidebar background - Light Mode */
  --sidebar-bg: #f3f4f6; /* Tailwind gray-100 */
}

.dark {
  /* Base background and text for the main content area - Dark Mode */
  --bg-main-content: #111827; /* Tailwind gray-900 for dark mode main background */
  --text-main: #f3f4f6; /* Tailwind gray-100 for dark mode text */

  /* Sidebar specific text colors - Dark Mode */
  --sidebar-text-main-συγκεκριμένα: #d1d5db; /* Tailwind gray-300 */
  --sidebar-text-muted-συγκεκριμένα: #9ca3af; /* Tailwind gray-400 */

  /* Status specific colors - Dark Mode */
  --status-connected-color: #1c9376; /* Your specified green */
  --status-connected-orb-glow-start: rgba(28, 147, 118, 0.4); /* Slightly more visible in dark */
  --status-connected-orb-glow-end: rgba(28, 147, 118, 0.7);
  --status-disconnected-color: #f87171; /* Tailwind red-400 */
  --status-disconnected-orb-glow-start: rgba(248, 113, 113, 0.4);
  --status-disconnected-orb-glow-end: rgba(248, 113, 113, 0.7);

  /* Sidebar background - Dark Mode */
  --sidebar-bg: #1f2937; /* Tailwind gray-800, or a custom dark like #1A202C */
}

/* General body style */
body {
  margin: 0;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--bg-main-content); /* Applied to body for scrollbar consistency */
  color: var(--text-main);
}

/* Sidebar styles */
.bg-gray-100 {
  background-color: var(--sidebar-bg);
}
.dark .dark\:bg-gray-850 {
  background-color: var(--sidebar-bg);
} /* Ensure this matches your chosen dark sidebar bg */

.text-sidebar-main {
  color: var(--sidebar-text-main- συγκεκριμένα);
}
.dark .dark\:text-sidebar-dark-main {
  color: var(--sidebar-text-main- συγκεκριμένα);
}

/* Class for hover effect on standalone icons (e.g., when sidebar is collapsed) */
.icon-hover-effect-standalone {
  transition:
    transform 0.2s ease-out,
    color 0.15s ease-in-out;
}
.icon-hover-effect-standalone:hover {
  transform: scale(1.1);
  color: #1c9376 !important; /* Ensure hover color takes precedence */
}

/* Status Orb and Pulse Animation */
.status-orb {
  width: 9px; /* Slightly smaller orb */
  height: 9px;
  border-radius: 50%;
  display: inline-block;
  animation:
    pulse-glow 3.2s infinite ease-in-out,
    pulse-scale 2.5s infinite ease-in-out;
}
.orb-connected {
  background-color: var(--status-connected-color);
  --orb-glow-color-start: var(--status-connected-orb-glow-start);
  --orb-glow-color-end: var(--status-connected-orb-glow-end);
}
.orb-disconnected {
  background-color: var(--status-disconnected-color);
  --orb-glow-color-start: var(--status-disconnected-orb-glow-start);
  --orb-glow-color-end: var(--status-disconnected-orb-glow-end);
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 4px 0.5px var(--orb-glow-color-start);
  }
  50% {
    box-shadow: 0 0 7px 1.5px var(--orb-glow-color-end);
  }
}
@keyframes pulse-scale {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.88);
  }
}

/* Text for "Connected" status */
.status-connected-text {
  font-size: 0.875rem; /* 14px */
  line-height: 1.25rem; /* 20px */
  font-weight: 600; /* semibold */
  color: var(--status-connected-color); /* Use the defined connected color */
}
/* Text for latency display */
.status-latency-display-text {
  font-size: 0.75rem; /* 12px */
  line-height: 1rem; /* 16px */
  color: var(--sidebar-text-muted- συγκεκριμένα); /* Muted text for latency */
}

/* Status icon colors */
.text-status-connected {
  color: var(--status-connected-color);
}
.dark .dark\:text-status-dark-connected {
  color: var(--status-connected-color);
}
.text-status-disconnected {
  color: var(--status-disconnected-color);
}
.dark .dark\:text-status-dark-disconnected {
  color: var(--status-disconnected-color);
}

.group:hover .group-hover\:text-status-connected-hover {
  color: var(--status-connected-color) !important;
}
.dark .group:hover .dark\:group-hover\:text-status-dark-connected-hover {
  color: var(--status-connected-color) !important;
}

.min-w-0 {
  min-width: 0;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Animation for spinning icon (e.g., RotateCcw) */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}

/* Animation for button shake on retry failure */
@keyframes shake-effect {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-2px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(2px);
  }
}
.animate-shake {
  animation: shake-effect 0.4s ease-in-out;
}

/* Transition for main content margin */
.transition-margin {
  transition-property: margin-left;
}

/* Overlay Fade Transition for modals */
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
.overlay-fade-enter-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.overlay-fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 1, 1);
}

/* Modal Pop Transition */
.modal-pop-enter-from,
.modal-pop-leave-to {
  opacity: 0;
  transform: scale(0.92) translateY(12px);
}
.modal-pop-enter-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); /* Springy entrance */
}
.modal-pop-leave-active {
  transition: all 0.2s cubic-bezier(0.55, 0.055, 0.675, 0.19); /* Faster exit */
}
.modal-pop-enter-to,
.modal-pop-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}
</style>
