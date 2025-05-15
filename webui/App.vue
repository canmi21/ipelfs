<script setup lang="ts">
import { useDark } from '@vueuse/core'
import { ref, watchEffect, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router' // Import useRouter
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
  FileJson2,
} from 'lucide-vue-next'

// --- Router ---
const router = useRouter() // Initialize router instance

const navigateTo = (path: string) => {
  router.push(path) // Use router.push for navigation
}

// --- Theme Initialization ---
const storedTheme = localStorage.getItem('theme')
const isDark = useDark({
  valueDark: 'dark',
  valueLight: '',
  storageKey: null,
  initialValue: (() => {
    if (storedTheme === 'dark') return 'dark'
    if (storedTheme === 'light') return 'light'
    try {
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return systemIsDark ? 'dark' : 'light'
    } catch (e) {
      console.error('Failed to detect system color scheme:', e)
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

const handleToggle = () => {
  if (currentTheme.value === 'light') {
    try {
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (!systemIsDark) {
        currentIcon.value = 'moon'
        currentTheme.value = 'dark'
        isDark.value = true
        localStorage.setItem('theme', 'dark')
      } else {
        currentIcon.value = 'sun-moon'
        currentTheme.value = 'system'
        isDark.value = systemIsDark
        localStorage.removeItem('theme')
      }
    } catch (e) {
      console.error('Failed to switch theme based on system preference:', e)
      currentIcon.value = 'moon'
      currentTheme.value = 'dark'
      isDark.value = true
      localStorage.setItem('theme', 'dark')
    }
  } else if (currentTheme.value === 'system') {
    currentIcon.value = 'moon'
    currentTheme.value = 'dark'
    isDark.value = true
    localStorage.setItem('theme', 'dark')
  } else {
    currentIcon.value = 'sun'
    currentTheme.value = 'light'
    isDark.value = false
    localStorage.setItem('theme', 'light')
  }
}

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
      return false
    }
  }
  return false
}

const isSidebarCollapsed = ref(getInitialSidebarState())
const showSidebarText = ref(!isSidebarCollapsed.value)
const showGithubIcon = ref(!isSidebarCollapsed.value)
const showInlineStatusText = ref(!isSidebarCollapsed.value)
const sidebarWidthClass = ref(isSidebarCollapsed.value ? 'w-14' : 'w-56')
const contentMarginClass = ref(isSidebarCollapsed.value ? 'ml-14' : 'ml-56')
const isAnimating = ref(false)
const githubIconCollapseTimer = ref<number | undefined>(undefined)
const githubIconExpandTimer = ref<number | undefined>(undefined)
const statusTextExpandTimer = ref<number | undefined>(undefined)
const mainContentEl = ref<HTMLElement | null>(null)

watchEffect(() => {
  localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed.value))
})

// --- Backend Connection State & Dynamic Health Check ---
const isBackendConnected = ref(true)
const latencyMs = ref<number | null>(null)
const healthCheckTimerId = ref<number | undefined>(undefined)
const currentHealthCheckIntervalMs = ref(1000)
const offlineStartTime = ref<number | null>(null)
const isRetryingManualCheck = ref(false)
const manualRetryButtonTimeoutId = ref<number | undefined>(undefined)
const triggerShake = ref(false)
const showRetryFailureIcon = ref(false)

// --- JavaScript Error State ---
const showJavascriptErrorOverlay = ref(false)
const jsErrorHelpLink = 'https://www.enable-javascript.com/'

function truncate(num: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces)
  return Math.floor(num * factor) / factor
}

const formattedLatency = computed(() => {
  const ms = latencyMs.value
  if (ms === null || ms < 0) return null
  if (ms === 0) return '0ms'
  const ns = ms * 1_000_000
  if (ms > 0 && ms < 0.001) return `${Math.floor(ns)}ns`
  if (ms < 1000) {
    if (ms < 10) return `${truncate(ms, 2).toFixed(2)}ms`
    if (ms < 100) return `${truncate(ms, 1).toFixed(1)}ms`
    return `${Math.floor(ms)}ms`
  } else {
    const s = ms / 1000
    if (s < 10) return `${truncate(s, 2).toFixed(2)}s`
    if (s < 100) return `${truncate(s, 1).toFixed(1)}s`
    return `${Math.floor(s)}s`
  }
})

const checkBackendStatus = async () => {
  const requestSentTimestamp = Date.now()
  try {
    const response = await fetch('http://localhost:33330/v1/ipelfs/healthcheck')
    if (response.ok) {
      const data = await response.json()
      if (data.success === true) {
        isBackendConnected.value = true
        try {
          const backendTimestampStr = data.data as string
          const datePart = backendTimestampStr.substring(0, 19)
          const fractionalPartMatch = backendTimestampStr.match(/\.(\d+)/)
          let timezonePart = 'Z'
          const timezoneMatch = backendTimestampStr.substring(19).match(/[Z+-].*$/)
          if (timezoneMatch) timezonePart = timezoneMatch[0]
          let backendEpochNs: bigint
          const baseMsBigInt = BigInt(new Date(datePart + timezonePart).getTime())
          if (fractionalPartMatch && fractionalPartMatch[1]) {
            const nanoStr = fractionalPartMatch[1].padEnd(9, '0').substring(0, 9)
            backendEpochNs = baseMsBigInt * 1_000_000n + BigInt(nanoStr)
          } else {
            backendEpochNs = baseMsBigInt * 1_000_000n
          }
          const requestSentEpochNs = BigInt(requestSentTimestamp) * 1_000_000n
          latencyMs.value = Number(backendEpochNs - requestSentEpochNs) / 1_000_000.0
        } catch (e) {
          console.error('Error parsing backend timestamp or calculating latency:', e)
          latencyMs.value = -1
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

const performHealthCheckAndScheduleNext = async () => {
  if (healthCheckTimerId.value !== undefined) {
    clearTimeout(healthCheckTimerId.value)
  }
  await checkBackendStatus()

  if (isBackendConnected.value) {
    currentHealthCheckIntervalMs.value = 1000
    offlineStartTime.value = null
    if (isRetryingManualCheck.value) {
      isRetryingManualCheck.value = false
      showRetryFailureIcon.value = false
      if (manualRetryButtonTimeoutId.value !== undefined) {
        clearTimeout(manualRetryButtonTimeoutId.value)
        manualRetryButtonTimeoutId.value = undefined
      }
    }
  } else {
    if (offlineStartTime.value === null) {
      offlineStartTime.value = Date.now()
    }
    const minutesOffline = Math.max(
      0,
      Math.floor((Date.now() - (offlineStartTime.value || Date.now())) / (1000 * 60)),
    )
    currentHealthCheckIntervalMs.value = 5000 * Math.pow(2, Math.min(minutesOffline, 6))
  }
  healthCheckTimerId.value = window.setTimeout(
    performHealthCheckAndScheduleNext,
    currentHealthCheckIntervalMs.value,
  )
}

const triggerManualHealthCheck = async () => {
  if (isRetryingManualCheck.value || showRetryFailureIcon.value) return

  isRetryingManualCheck.value = true
  triggerShake.value = false
  showRetryFailureIcon.value = false

  if (healthCheckTimerId.value !== undefined) clearTimeout(healthCheckTimerId.value)
  if (manualRetryButtonTimeoutId.value !== undefined) clearTimeout(manualRetryButtonTimeoutId.value)

  manualRetryButtonTimeoutId.value = window.setTimeout(() => {
    if (!isBackendConnected.value) {
      isRetryingManualCheck.value = false
      showRetryFailureIcon.value = true
      triggerShake.value = true
      setTimeout(() => {
        triggerShake.value = false
        setTimeout(() => {
          showRetryFailureIcon.value = false
        }, 700)
      }, 300)
    }
  }, 3000)

  await performHealthCheckAndScheduleNext()
}

const openExternalLink = (url: string) => {
  window.open(url, '_blank', 'noopener noreferrer')
}

const refreshPage = () => {
  window.location.reload()
}

onMounted(() => {
  checkBackendStatus().then(() => {
    if (isBackendConnected.value) {
      currentHealthCheckIntervalMs.value = 1000
      offlineStartTime.value = null
    } else {
      offlineStartTime.value = Date.now()
      const minutesOffline = 0
      currentHealthCheckIntervalMs.value = 5000 * Math.pow(2, Math.min(minutesOffline, 6))
    }
    healthCheckTimerId.value = window.setTimeout(
      performHealthCheckAndScheduleNext,
      currentHealthCheckIntervalMs.value,
    )
  })

  if (typeof window.addEventListener === 'undefined') {
    showJavascriptErrorOverlay.value = true
  }
})

onUnmounted(() => {
  if (healthCheckTimerId.value !== undefined) clearTimeout(healthCheckTimerId.value)
  if (manualRetryButtonTimeoutId.value !== undefined) clearTimeout(manualRetryButtonTimeoutId.value)
  if (githubIconCollapseTimer.value !== undefined) clearTimeout(githubIconCollapseTimer.value)
  if (githubIconExpandTimer.value !== undefined) clearTimeout(githubIconExpandTimer.value)
  if (statusTextExpandTimer.value !== undefined) clearTimeout(statusTextExpandTimer.value)
})

const handleSidebarToggle = () => {
  if (isAnimating.value) return
  isAnimating.value = true

  if (githubIconCollapseTimer.value !== undefined) clearTimeout(githubIconCollapseTimer.value)
  if (githubIconExpandTimer.value !== undefined) clearTimeout(githubIconExpandTimer.value)
  if (statusTextExpandTimer.value !== undefined) clearTimeout(statusTextExpandTimer.value)
  githubIconCollapseTimer.value = undefined
  githubIconExpandTimer.value = undefined
  statusTextExpandTimer.value = undefined

  const currentlyCollapsed = isSidebarCollapsed.value
  const animationDuration = 300
  const expandShowEarlyMs = 50

  if (!currentlyCollapsed) {
    isSidebarCollapsed.value = true
    showGithubIcon.value = false
    showInlineStatusText.value = false
    const generalTextHideDelay = Math.max(50, animationDuration - 150)
    setTimeout(() => {
      if (isSidebarCollapsed.value) showSidebarText.value = false
    }, generalTextHideDelay)
    nextTick(() => {
      sidebarWidthClass.value = 'w-14'
      contentMarginClass.value = 'ml-14'
    })
    const onCollapseAnimationEnd = () => {
      isAnimating.value = false
    }
    if (mainContentEl.value) {
      mainContentEl.value.addEventListener('transitionend', onCollapseAnimationEnd, { once: true })
    } else {
      setTimeout(onCollapseAnimationEnd, animationDuration + 50)
    }
  } else {
    isSidebarCollapsed.value = false
    sidebarWidthClass.value = 'w-56'
    nextTick(() => {
      contentMarginClass.value = 'ml-56'
      const baseTextShowTime = Math.max(0, animationDuration - expandShowEarlyMs - 50)
      setTimeout(() => {
        if (!isSidebarCollapsed.value) showSidebarText.value = true
      }, baseTextShowTime)
      const showIconTime = Math.max(0, animationDuration - expandShowEarlyMs)
      githubIconExpandTimer.value = window.setTimeout(() => {
        if (!isSidebarCollapsed.value) showGithubIcon.value = true
      }, showIconTime)
      const showStatusTextTime = Math.max(0, animationDuration - expandShowEarlyMs + 20)
      statusTextExpandTimer.value = window.setTimeout(() => {
        if (!isSidebarCollapsed.value) showInlineStatusText.value = true
      }, showStatusTextTime)
    })
    const onExpandAnimationEnd = () => {
      if (!isSidebarCollapsed.value) {
        if (!showGithubIcon.value) showGithubIcon.value = true
        if (!showInlineStatusText.value) showInlineStatusText.value = true
        if (!showSidebarText.value) showSidebarText.value = true
      }
      isAnimating.value = false
    }
    if (mainContentEl.value) {
      mainContentEl.value.addEventListener('transitionend', onExpandAnimationEnd, { once: true })
    } else {
      setTimeout(onExpandAnimationEnd, animationDuration + 50)
    }
  }
}

const openRepositoryIssuesPage = () => {
  openExternalLink('https://github.com/canmi21/ipelfs/issues')
}
</script>

<template>
  <div
    class="relative min-h-screen"
    :style="{ backgroundColor: 'var(--bg-main-content)', color: 'var(--text-main-color)' }"
  >
    <div
      :class="sidebarWidthClass"
      class="fixed top-0 left-0 h-full bg-sidebar z-30 transition-all ease-in-out duration-300 overflow-hidden flex flex-col"
    >
      <div class="h-14 shrink-0 flex items-center border-b border-sidebar-border">
        <div class="w-14 h-14 flex-shrink-0 flex items-center justify-center">
          <div
            @click="handleSidebarToggle"
            class="cursor-pointer p-1.5 rounded-md group"
            title="Toggle Sidebar"
          >
            <component
              :is="isSidebarCollapsed ? PanelRightClose : PanelRightOpen"
              class="w-6 h-6 text-icon-muted group-hover:text-icon-accent transform transition-all duration-150 group-hover:scale-110"
            />
          </div>
        </div>
        <div
          v-if="!isSidebarCollapsed && showGithubIcon"
          @click="openExternalLink('https://github.com/canmi21/ipelfs')"
          class="cursor-pointer p-1.5 rounded-md group ml-auto mr-3"
          title="Open GitHub Repository"
        >
          <SquareArrowOutUpRight
            class="w-5 h-5 text-icon-muted group-hover:text-icon-accent transform transition-all duration-150 group-hover:scale-110"
          />
        </div>
      </div>

      <nav class="flex-grow pt-2">
        <ul class="space-y-1">
          <li
            @click="navigateTo('/volumes')"
            class="cursor-pointer group rounded-md flex items-center h-11 mx-2"
            :class="{
              'hover:bg-sidebar-item-hover-bg dark:hover:bg-sidebar-item-dark-hover-bg':
                !isSidebarCollapsed,
            }"
          >
            <div class="w-10 h-11 flex-shrink-0 flex items-center justify-center">
              <Server
                class="w-6 h-6 text-icon-muted transition-all duration-150 transform group-hover:text-icon-accent"
                :class="{ 'group-hover:scale-110': isSidebarCollapsed }"
              />
            </div>
            <span
              v-if="showSidebarText"
              class="pl-1 pr-2 text-base font-medium text-sidebar-main group-hover:text-icon-accent transition-colors duration-150 truncate"
            >
              Volumes
            </span>
          </li>
          <li
            @click="navigateTo('/collections')"
            class="cursor-pointer group rounded-md flex items-center h-11 mx-2"
            :class="{
              'hover:bg-sidebar-item-hover-bg dark:hover:bg-sidebar-item-dark-hover-bg':
                !isSidebarCollapsed,
            }"
          >
            <div class="w-10 h-11 flex-shrink-0 flex items-center justify-center">
              <DatabaseZap
                class="w-6 h-6 text-icon-muted transition-all duration-150 transform group-hover:text-icon-accent"
                :class="{ 'group-hover:scale-110': isSidebarCollapsed }"
              />
            </div>
            <span
              v-if="showSidebarText"
              class="pl-1 pr-2 text-base font-medium text-sidebar-main group-hover:text-icon-accent transition-colors duration-150 truncate"
            >
              Collections
            </span>
          </li>
          <li
            @click="navigateTo('/activity')"
            class="cursor-pointer group rounded-md flex items-center h-11 mx-2"
            :class="{
              'hover:bg-sidebar-item-hover-bg dark:hover:bg-sidebar-item-dark-hover-bg':
                !isSidebarCollapsed,
            }"
          >
            <div class="w-10 h-11 flex-shrink-0 flex items-center justify-center">
              <FileClock
                class="w-6 h-6 text-icon-muted transition-all duration-150 transform group-hover:text-icon-accent"
                :class="{ 'group-hover:scale-110': isSidebarCollapsed }"
              />
            </div>
            <span
              v-if="showSidebarText"
              class="pl-1 pr-2 text-base font-medium text-sidebar-main group-hover:text-icon-accent transition-colors duration-150 truncate"
            >
              Activity
            </span>
          </li>
        </ul>
      </nav>

      <div class="mt-auto shrink-0 mx-2 mb-2 border-t border-sidebar-border pt-2">
        <div class="flex items-center h-11 rounded-md cursor-default">
          <div class="w-10 h-11 flex-shrink-0 flex items-center justify-center">
            <component
              :is="isBackendConnected ? Server : ServerOff"
              class="w-6 h-6 flex-shrink-0 transition-colors duration-150"
              :class="{
                'text-status-connected': isBackendConnected,
                'text-status-disconnected': !isBackendConnected,
              }"
            />
          </div>
          <div
            v-if="showInlineStatusText && !isSidebarCollapsed"
            class="pl-1 pr-2 status-text-wrapper flex-grow min-w-0 flex justify-center items-center"
          >
            <div v-if="!isBackendConnected" class="flex items-center">
              <span class="status-orb orb-disconnected mr-1.5 flex-shrink-0"></span>
              <span class="font-medium text-sm truncate text-status-disconnected"
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
      class="absolute top-4 right-4 z-40 cursor-pointer p-1.5 rounded-md group"
      @click="handleToggle"
      title="Toggle Theme"
    >
      <component
        :is="currentIcon === 'sun' ? Sun : currentIcon === 'moon' ? Moon : SunMoon"
        class="w-6 h-6 text-icon-muted group-hover:text-icon-accent transform transition-all duration-150 group-hover:scale-110"
      />
    </div>

    <div
      ref="mainContentEl"
      :class="contentMarginClass"
      class="relative z-20 transition-margin ease-in-out duration-300 min-h-screen overflow-y-auto"
      :style="{ backgroundColor: 'var(--bg-main-content)' }"
    >
      <router-view v-slot="{ Component }">
        <transition name="fade-router" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
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
            class="modal-card-content bg-modal-bg text-modal-text p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg relative"
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
                class="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full transition-colors duration-150"
                title="Open GitHub Issues"
                aria-label="Open GitHub Issues for help"
              >
                <ExternalLink class="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div class="flex items-center mb-5 text-modal-text-secondary">
              <strong class="text-sm sm:text-base">WebUI is currently unavailable.</strong>
            </div>
            <ul class="space-y-2.5 text-sm sm:text-base text-modal-text-secondary">
              <li class="flex items-start">
                <span class="mr-2 text-red-500 dark:text-red-400 flex-shrink-0">&rarr;</span>Ensure
                the <strong>ipelfs service</strong> is running.
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-red-500 dark:text-red-400 flex-shrink-0">&rarr;</span>Verify
                device and server are on the <strong>same network</strong>.
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-red-500 dark:text-red-400 flex-shrink-0">&rarr;</span>Check
                <strong>firewall settings</strong> for port <code>33330</code>.
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-red-500 dark:text-red-400 flex-shrink-0">&rarr;</span>Confirm
                backend URL (e.g., <code>http://localhost:33330</code>).
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-red-500 dark:text-red-400 flex-shrink-0">&rarr;</span>Inspect
                <strong>developer console</strong> and backend logs.
              </li>
            </ul>
            <button
              @click="triggerManualHealthCheck"
              :disabled="isRetryingManualCheck || showRetryFailureIcon"
              class="mt-6 w-full font-semibold py-2.5 px-4 rounded-lg transition-all duration-150 ease-in-out flex items-center justify-center text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              :class="[
                isRetryingManualCheck
                  ? 'bg-gray-400 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                  : showRetryFailureIcon
                    ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white focus:ring-red-500'
                    : 'bg-button-primary hover:bg-button-primary-hover text-white focus:ring-button-primary-focus',
                { 'animate-shake': triggerShake },
              ]"
            >
              <template v-if="showRetryFailureIcon"
                ><IconX class="w-5 h-5 mr-0 sm:mr-2" /><span class="hidden sm:inline"
                  >Failed to Connect</span
                ></template
              >
              <template v-else
                ><RotateCcw
                  class="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                  :class="{ 'animate-spin': isRetryingManualCheck }"
                /><span>{{
                  isRetryingManualCheck ? 'Retrying...' : 'Retry Connection'
                }}</span></template
              >
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
            class="modal-card-content bg-modal-bg text-modal-text p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg relative"
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
                class="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full transition-colors duration-150"
                title="Why is JavaScript needed?"
                aria-label="Why is JavaScript needed?"
              >
                <ExternalLink class="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div class="flex items-center mb-5 text-modal-text-secondary">
              <strong class="text-sm sm:text-base"
                >The WebUI requires JavaScript to function.</strong
              >
            </div>
            <p class="text-sm sm:text-base text-modal-text-secondary mb-3">
              JavaScript is essential for:
            </p>
            <ul class="space-y-2 text-sm sm:text-base text-modal-text-secondary">
              <li class="flex items-start">
                <span class="mr-2 text-orange-500 dark:text-orange-400 flex-shrink-0">&rarr;</span
                >Interactive UI elements and smooth animations.
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-orange-500 dark:text-orange-400 flex-shrink-0">&rarr;</span
                >Backend communication for live updates.
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-orange-500 dark:text-orange-400 flex-shrink-0">&rarr;</span
                >Dynamic content rendering and interactions.
              </li>
              <li class="flex items-start">
                <span class="mr-2 text-orange-500 dark:text-orange-400 flex-shrink-0">&rarr;</span
                >Overall application logic.
              </li>
            </ul>
            <p class="text-sm sm:text-base text-modal-text-secondary mt-4">
              Please enable JavaScript in your browser settings and refresh the page.
            </p>
            <button
              @click="refreshPage"
              class="mt-6 w-full bg-button-primary hover:bg-button-primary-hover text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-150 ease-in-out flex items-center justify-center text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-button-primary-focus"
            >
              <RotateCcw class="w-4 h-4 sm:w-5 sm:h-5 mr-2" />Refresh Page
            </button>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style>
:root {
  /* --- Main Content Colors --- */
  --bg-main-content: #ffffff;
  --text-main-color: #1f2937;

  /* --- Sidebar Colors --- */
  --sidebar-bg: #f3f4f6;
  --sidebar-text-main: #1f2937;
  --sidebar-text-muted: #6b7280;
  --sidebar-item-hover-bg: #e5e7eb;
  --sidebar-border-color: #e5e7eb; /* For light mode borders */

  /* --- Icon Colors --- */
  --icon-muted-color: #6b7280;
  --icon-accent-color: #1c9376;

  /* --- Status Colors --- */
  --status-connected-color: #1c9376;
  --status-connected-orb-glow-start: rgba(28, 147, 118, 0.3);
  --status-connected-orb-glow-end: rgba(28, 147, 118, 0.6);
  --status-disconnected-color: #ef4444;
  --status-disconnected-orb-glow-start: rgba(239, 68, 68, 0.3);
  --status-disconnected-orb-glow-end: rgba(239, 68, 68, 0.6);

  /* --- Modal Colors --- */
  --modal-bg-color: #ffffff;
  --modal-text-color: #1f2937;
  --modal-text-secondary-color: #4b5563;

  /* --- Button Colors --- */
  --button-primary-bg: #1b9e7d;
  --button-primary-hover-bg: #168266;
  --button-primary-focus-ring: #168266;
}

.dark {
  --bg-main-content: #030712;
  --text-main-color: #f3f4f6;

  --sidebar-bg: #111827;
  --sidebar-text-main: #d1d5db;
  --sidebar-text-muted: #9ca3af;
  --sidebar-item-hover-bg: #1f2937;
  --sidebar-border-color: #374151; /* For dark mode borders (gray-700) */

  --icon-muted-color: #9ca3af;

  --status-connected-orb-glow-start: rgba(28, 147, 118, 0.4);
  --status-connected-orb-glow-end: rgba(28, 147, 118, 0.7);
  --status-disconnected-color: #f87171;
  --status-disconnected-orb-glow-start: rgba(248, 113, 113, 0.4);
  --status-disconnected-orb-glow-end: rgba(248, 113, 113, 0.7);

  --modal-bg-color: #1f2937;
  --modal-text-color: #f3f4f6;
  --modal-text-secondary-color: #9ca3af;
}

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
  background-color: var(--bg-main-content);
  color: var(--text-main-color);
}

.bg-sidebar {
  background-color: var(--sidebar-bg);
}
.text-sidebar-main {
  color: var(--sidebar-text-main);
}
.border-sidebar-border {
  border-color: var(--sidebar-border-color);
} /* For sidebar internal borders */

.text-icon-muted {
  color: var(--icon-muted-color);
}
.group:hover .group-hover\:text-icon-accent {
  color: var(--icon-accent-color) !important;
}

.hover\:bg-sidebar-item-hover-bg:hover {
  background-color: var(--sidebar-item-hover-bg);
}
.dark .dark\:hover\:bg-sidebar-item-dark-hover-bg:hover {
  background-color: var(--sidebar-item-hover-bg);
}

.text-status-connected {
  color: var(--status-connected-color);
}
.text-status-disconnected {
  color: var(--status-disconnected-color);
}

.bg-modal-bg {
  background-color: var(--modal-bg-color);
}
.text-modal-text {
  color: var(--modal-text-color);
}
.text-modal-text-secondary {
  color: var(--modal-text-secondary-color);
}

.bg-button-primary {
  background-color: var(--button-primary-bg);
}
.hover\:bg-button-primary-hover:hover {
  background-color: var(--button-primary-hover-bg);
}
.focus\:ring-button-primary-focus:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 3px var(--button-primary-focus-ring);
}

.status-orb {
  width: 9px;
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

.status-connected-text {
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 600;
  color: var(--status-connected-color);
}
.status-latency-display-text {
  font-size: 0.75rem;
  line-height: 1rem;
  color: var(--sidebar-text-muted);
}

.min-w-0 {
  min-width: 0;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
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

.transition-margin {
  transition-property: margin-left;
}

/* Router view transition */
.fade-router-enter-active,
.fade-router-leave-active {
  transition: opacity 0.15s ease;
}
.fade-router-enter-from,
.fade-router-leave-to {
  opacity: 0;
}

/* Overlay and Modal transitions (existing) */
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
.modal-pop-enter-from,
.modal-pop-leave-to {
  opacity: 0;
  transform: scale(0.92) translateY(12px);
}
.modal-pop-enter-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-pop-leave-active {
  transition: all 0.2s cubic-bezier(0.55, 0.055, 0.675, 0.19);
}
.modal-pop-enter-to,
.modal-pop-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}
</style>
