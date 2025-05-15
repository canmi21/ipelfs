<script setup lang="ts">
import { useDark } from '@vueuse/core'
import { ref, watchEffect, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  Sun, Moon, SunMoon,
  PanelRightOpen, PanelRightClose,
  Cuboid, SquareArrowOutUpRight,
  Server, ServerOff,
  RotateCcw // Added for the retry button
} from 'lucide-vue-next'

// --- Theme Initialization ---
const storedTheme = localStorage.getItem('theme')
const isDark = useDark({
  valueDark: 'dark',
  valueLight: '', // Value for light mode (class removed by .toggle('dark', false))
  storageKey: null, // Manual localStorage handling for theme
  initialValue: (() => {
    if (storedTheme === 'dark') return 'dark'
    if (storedTheme === 'light') return 'light' // Ensure 'light' is returned for BasicColorSchema
    try {
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return systemIsDark ? 'dark' : 'light' // Ensure 'light' for BasicColorSchema
    } catch (e) {
      console.error("Failed to detect system color scheme:", e);
      localStorage.setItem('theme', 'dark')
      return 'dark'
    }
  })()
})

const currentIcon = ref<'sun' | 'moon' | 'sun-moon'>(
  storedTheme === 'dark' ? 'moon' :
  storedTheme === 'light' ? 'sun' :
  'sun-moon'
)
const currentTheme = ref<'light' | 'dark' | 'system'>(
  storedTheme === 'dark' ? 'dark' :
  storedTheme === 'light' ? 'light' :
  'system'
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
        isDark.value = systemIsDark // Sync with system
        localStorage.removeItem('theme') // Remove to follow system
      }
    } catch (e) {
      console.error("Failed to switch theme based on system preference:", e);
      currentIcon.value = 'moon'
      currentTheme.value = 'dark'
      isDark.value = true
      localStorage.setItem('theme', 'dark') // Fallback to dark on error
    }
  } else if (currentTheme.value === 'system') {
     currentIcon.value = 'moon'
     currentTheme.value = 'dark'
     isDark.value = true
     localStorage.setItem('theme', 'dark')
  } else { // currentTheme is 'dark'
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
  const storedState = localStorage.getItem('sidebarCollapsed');
  if (storedState !== null) {
    try {
      return JSON.parse(storedState);
    } catch (e) {
      console.error("Failed to parse sidebarCollapsed from localStorage. Defaulting to expanded.", e);
      return false;
    }
  }
  return false; // Default to expanded (false) if no value in localStorage (first visit)
};

const isSidebarCollapsed = ref(getInitialSidebarState());

const showSidebarText = ref(!isSidebarCollapsed.value);
const showGithubIcon = ref(!isSidebarCollapsed.value);
const showInlineStatusText = ref(!isSidebarCollapsed.value);
const sidebarWidthClass = ref(isSidebarCollapsed.value ? 'w-14' : 'w-56');
const contentMarginClass = ref(isSidebarCollapsed.value ? 'ml-14' : 'ml-64');

const isAnimating = ref(false);
const githubIconCollapseTimer = ref<number | undefined>(undefined);
const githubIconExpandTimer = ref<number | undefined>(undefined);
const statusTextExpandTimer = ref<number | undefined>(undefined);
const mainContentEl = ref<HTMLElement | null>(null);

watchEffect(() => {
  localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed.value));
});

// --- Backend Connection State & Dynamic Health Check ---
const isBackendConnected = ref(true); // Assume connected initially to avoid immediate overlay flash
const latencyMs = ref<number | null>(null);
const healthCheckTimerId = ref<number | undefined>(undefined);
const currentHealthCheckIntervalMs = ref(1000); // Initial interval before first check
const offlineStartTime = ref<number | null>(null);

function truncate(num: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces);
  return Math.floor(num * factor) / factor;
}

const formattedLatency = computed(() => {
  const ms = latencyMs.value;
  if (ms === null || ms < 0) return null;
  if (ms === 0) return "0ms";
  const ns = ms * 1_000_000;
  if (ms > 0 && ms < 0.001) return `${Math.floor(ns)}ns`;
  if (ms < 1000) {
    if (ms < 10) return `${truncate(ms, 2).toFixed(2)}ms`;
    if (ms < 100) return `${truncate(ms, 1).toFixed(1)}ms`;
    return `${Math.floor(ms)}ms`;
  } else {
    const s = ms / 1000;
    if (s < 10) return `${truncate(s, 2).toFixed(2)}s`;
    if (s < 100) return `${truncate(s, 1).toFixed(1)}s`;
    return `${Math.floor(s)}s`;
  }
});

// Core function to check backend status
const checkBackendStatus = async () => {
  const requestSentTimestamp = Date.now();
  try {
    const response = await fetch('http://localhost:33330/v1/ipelfs/healthcheck');
    if (response.ok) {
      const data = await response.json();
      if (data.success === true) {
        isBackendConnected.value = true;
        try {
          const backendTimestampStr = data.data as string;
          const datePart = backendTimestampStr.substring(0, 19);
          const fractionalPartMatch = backendTimestampStr.match(/\.(\d+)/);
          let timezonePart = "Z";
          const timezoneMatch = backendTimestampStr.substring(19).match(/[Z+-].*$/);
          if (timezoneMatch) timezonePart = timezoneMatch[0];
          
          let backendEpochNs: bigint;
          const baseMsBigInt = BigInt(new Date(datePart + timezonePart).getTime());
          if (fractionalPartMatch && fractionalPartMatch[1]) {
            let nanoStr = fractionalPartMatch[1].padEnd(9, '0').substring(0,9);
            backendEpochNs = baseMsBigInt * 1_000_000n + BigInt(nanoStr);
          } else {
            backendEpochNs = baseMsBigInt * 1_000_000n;
          }
          const requestSentEpochNs = BigInt(requestSentTimestamp) * 1_000_000n;
          latencyMs.value = Number(backendEpochNs - requestSentEpochNs) / 1_000_000.0;
        } catch (e) {
          console.error("Error parsing backend timestamp or calculating latency:", e);
          latencyMs.value = null;
        }
      } else {
        isBackendConnected.value = false;
        latencyMs.value = null;
      }
    } else {
      console.warn(`Health check received non-ok status: ${response.status}`);
      isBackendConnected.value = false;
      latencyMs.value = null;
    }
  } catch (error) {
    console.error("Health check request failed:", error);
    isBackendConnected.value = false;
    latencyMs.value = null;
  }
};

// Performs health check and schedules the next one with dynamic interval
const performHealthCheckAndScheduleNext = async () => {
  if (healthCheckTimerId.value !== undefined) {
    clearTimeout(healthCheckTimerId.value); // Clear previous timer
  }

  await checkBackendStatus(); // Perform the actual check

  // Determine next interval based on connection status
  if (isBackendConnected.value) {
    currentHealthCheckIntervalMs.value = 1000; // 1 second if online
    offlineStartTime.value = null; // Reset offline start time
  } else {
    if (offlineStartTime.value === null) {
      offlineStartTime.value = Date.now(); // Mark when it first went offline
    }
    // Calculate minutes offline, ensuring it's at least 0
    const minutesOffline = Math.max(0, Math.floor((Date.now() - offlineStartTime.value) / (1000 * 60)));
    // Initial interval 5s, then doubles each minute: 5s * 2^minutesOffline
    currentHealthCheckIntervalMs.value = 5000 * Math.pow(2, minutesOffline);
  }

  // Schedule the next check
  healthCheckTimerId.value = window.setTimeout(performHealthCheckAndScheduleNext, currentHealthCheckIntervalMs.value);
};

// Manually trigger a health check (e.g., from a button)
const triggerManualHealthCheck = async () => {
  if (healthCheckTimerId.value !== undefined) {
    clearTimeout(healthCheckTimerId.value); // Stop any scheduled check
  }
  // Perform an immediate check, which will then schedule the next one
  await performHealthCheckAndScheduleNext();
};

onMounted(() => {
  performHealthCheckAndScheduleNext(); // Start the health check cycle
});

onUnmounted(() => {
  if (healthCheckTimerId.value !== undefined) {
    clearTimeout(healthCheckTimerId.value); // Stop health checks
  }
  if (githubIconCollapseTimer.value !== undefined) clearTimeout(githubIconCollapseTimer.value);
  if (githubIconExpandTimer.value !== undefined) clearTimeout(githubIconExpandTimer.value);
  if (statusTextExpandTimer.value !== undefined) clearTimeout(statusTextExpandTimer.value);
});

const handleSidebarToggle = () => {
  if (isAnimating.value) return;
  isAnimating.value = true;

  if (githubIconCollapseTimer.value !== undefined) clearTimeout(githubIconCollapseTimer.value);
  if (githubIconExpandTimer.value !== undefined) clearTimeout(githubIconExpandTimer.value);
  if (statusTextExpandTimer.value !== undefined) clearTimeout(statusTextExpandTimer.value);
  githubIconCollapseTimer.value = undefined;
  githubIconExpandTimer.value = undefined;
  statusTextExpandTimer.value = undefined;

  const currentlyCollapsed = isSidebarCollapsed.value;
  const animationDuration = 300;
  const expandShowEarlyMs = 50;

  if (!currentlyCollapsed) { // Intent: COLLAPSE
    isSidebarCollapsed.value = true;
    showGithubIcon.value = false;
    showInlineStatusText.value = false;
    nextTick(() => { contentMarginClass.value = 'ml-14'; });
    const generalTextHideDelay = Math.max(50, animationDuration - 150);
    setTimeout(() => { if (isSidebarCollapsed.value) showSidebarText.value = false; }, generalTextHideDelay);
    const onCollapseAnimationEnd = () => {
      if (isSidebarCollapsed.value) sidebarWidthClass.value = 'w-14';
      isAnimating.value = false;
    };
    if (mainContentEl.value) mainContentEl.value.addEventListener('transitionend', onCollapseAnimationEnd, { once: true });
    else setTimeout(onCollapseAnimationEnd, animationDuration + 50);
    sidebarWidthClass.value = 'w-14 anitrunk-width';
  } else { // Intent: EXPAND
    isSidebarCollapsed.value = false;
    sidebarWidthClass.value = 'w-56';
    nextTick(() => {
      contentMarginClass.value = 'ml-64';
      setTimeout(() => { if (!isSidebarCollapsed.value) showSidebarText.value = true; }, 50);
      const showIconTime = Math.max(0, animationDuration - expandShowEarlyMs);
      githubIconExpandTimer.value = window.setTimeout(() => { if (!isSidebarCollapsed.value) showGithubIcon.value = true; }, showIconTime);
      const showStatusTextTime = Math.max(0, animationDuration - expandShowEarlyMs + 20);
      statusTextExpandTimer.value = window.setTimeout(() => { if (!isSidebarCollapsed.value) showInlineStatusText.value = true; }, showStatusTextTime);
    });
    const onExpandAnimationEnd = () => {
      if (!isSidebarCollapsed.value) {
        if (!showGithubIcon.value) showGithubIcon.value = true;
        if (!showInlineStatusText.value) showInlineStatusText.value = true;
        if (!showSidebarText.value) showSidebarText.value = true;
      }
      isAnimating.value = false;
    };
    if (mainContentEl.value) mainContentEl.value.addEventListener('transitionend', onExpandAnimationEnd, { once: true });
    else setTimeout(onExpandAnimationEnd, animationDuration + 50);
  }
};

const openGitHubLink = () => {
  window.open('https://github.com/canmi21/ipelfs', '_blank', 'noopener noreferrer');
};
</script>

<template>
  <div class="relative min-h-screen" style="background-color: var(--bg); color: var(--text);">
    <div
      :class="sidebarWidthClass"
      class="absolute top-0 left-0 h-full bg-gray-200 dark:bg-gray-800 z-10 transition-all ease-in-out duration-300 overflow-hidden"
    >
      <div class="flex flex-col p-2 h-full">
        <div class="flex-grow w-full">
            <div @click="handleSidebarToggle" class="cursor-pointer mb-4 w-full rounded-md">
              <div class="flex items-center h-12 px-2">
                  <component
                  :is="isSidebarCollapsed ? PanelRightClose : PanelRightOpen"
                  class="w-6 h-6 text-black dark:text-white icon-hover"
                  />
              </div>
            </div>

            <ul class="space-y-1 w-full">
              <li
                  class="cursor-pointer rounded-md"
                  :class="{ 'hover:bg-gray-300 dark:hover:bg-gray-700': showSidebarText }"
              >
                  <div class="flex items-center h-10 px-2">
                  <Cuboid class="w-6 h-6 flex-shrink-0" :class="{ 'icon-hover': !showSidebarText }" />
                  <span v-if="showSidebarText" class="text-lg truncate ml-3">Tab 1</span>
                  </div>
              </li>
              <li
                  class="cursor-pointer rounded-md"
                  :class="{ 'hover:bg-gray-300 dark:hover:bg-gray-700': showSidebarText }"
              >
                  <div class="flex items-center h-10 px-2">
                  <Cuboid class="w-6 h-6 flex-shrink-0" :class="{ 'icon-hover': !showSidebarText }" />
                  <span v-if="showSidebarText" class="text-lg truncate ml-3">Tab 2</span>
                  </div>
              </li>
              <li
                  class="cursor-pointer rounded-md"
                  :class="{ 'hover:bg-gray-300 dark:hover:bg-gray-700': showSidebarText }"
              >
                  <div class="flex items-center h-10 px-2">
                  <Cuboid class="w-6 h-6 flex-shrink-0" :class="{ 'icon-hover': !showSidebarText }" />
                  <span v-if="showSidebarText" class="text-lg truncate ml-3">Tab 3</span>
                  </div>
              </li>
            </ul>
        </div>
      </div>

      <div
        v-show="showGithubIcon"
        class="absolute top-4 right-4 cursor-pointer"
        title="Open GitHub Repository"
        @click="openGitHubLink"
      >
        <SquareArrowOutUpRight class="w-6 h-6 text-black dark:text-white icon-hover" />
      </div>

      <div class="fixed-status-item-container absolute bottom-4 left-2 right-2">
        <div class="flex items-center h-10 px-2 rounded-md">
          <component
            :is="isBackendConnected ? Server : ServerOff"
            class="w-6 h-6 flex-shrink-0"
            :class="{
              'text-green-600 dark:text-green-500': isBackendConnected,
              'text-red-600 dark:text-red-500': !isBackendConnected
            }"
          />
          <div
            v-if="showInlineStatusText"
            class="status-text-wrapper ml-3 flex-grow min-w-0 flex justify-center items-center"
          >
            <div v-if="!isBackendConnected" class="flex items-center">
                <span class="status-orb orb-disconnected mr-1.5 flex-shrink-0"></span>
                <span class="font-medium text-xs truncate">Disconnected</span>
            </div>

            <div v-if="isBackendConnected" class="flex flex-col items-center">
                <div class="flex items-center"> <span class="status-orb orb-connected mr-1.5 flex-shrink-0"></span>
                    <span class="status-connected-text">Connected</span>
                </div>
                <div class="text-center -mt-1.5"> <span v-if="formattedLatency" class="status-latency-display-text">Latency: {{ formattedLatency }}</span>
                    <span v-else-if="latencyMs === null && healthCheckTimerId !== undefined" class="status-latency-display-text">Calculating...</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="absolute top-4 right-4 z-30 cursor-pointer" @click="handleToggle">
      <component
        :is="currentIcon === 'sun' ? Sun : currentIcon === 'moon' ? Moon : SunMoon"
        class="w-6 h-6 text-black dark:text-white icon-hover"
      />
    </div>

    <div
      ref="mainContentEl"
      :class="contentMarginClass"
      class="relative z-20 transition-all ease-in-out duration-300 flex items-center justify-center min-h-screen"
      style="background-color: var(--bg);"
    >
      <div class="text-xl text-center">
        Hello, World!
      </div>
    </div>

    <div
      v-if="!isBackendConnected"
      class="fixed inset-0 z-[9999] bg-gray-900 bg-opacity-40 dark:bg-black dark:bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out"
      aria-modal="true"
      role="dialog"
    >
      <div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg transform transition-all duration-300 ease-out scale-100 opacity-100">
        <button
          @click="triggerManualHealthCheck"
          class="absolute top-3 right-3 sm:top-4 sm:right-4 p-1 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors duration-150"
          title="Retry Connection"
          aria-label="Retry Connection"
        >
          <RotateCcw class="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div class="flex items-center mb-4">
            <ServerOff class="w-8 h-8 text-red-500 dark:text-red-400 mr-3 flex-shrink-0" />
            <h2 class="text-xl sm:text-2xl font-semibold text-red-600 dark:text-red-400">
                Connection Lost
            </h2>
        </div>

        <p class="mb-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
          <strong>The WebUI is currently unavailable</strong>
        </p>

        <ul class="space-y-2.5 text-sm sm:text-base text-gray-600 dark:text-gray-350">
          <li class="flex items-start">
            <span class="mr-2 text-red-500 dark:text-red-400 flex-shrink-0">&rarr;</span>
            <span>Ensure the <strong>ipelfs service</strong> is running on your backend server.</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2 text-red-500 dark:text-red-400 flex-shrink-0">&rarr;</span>
            <span>Verify that this device and the backend server are on the <strong>same network</strong>, or that the backend is publicly accessible and correctly configured.</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2 text-red-500 dark:text-red-400 flex-shrink-0">&rarr;</span>
            <span>Check your <strong>firewall settings</strong> (on the server or network) to ensure port <code>33330</code> is open and not blocked.</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2 text-red-500 dark:text-red-400 flex-shrink-0">&rarr;</span>
            <span>Confirm the backend URL (e.g., <code>http://localhost:33330</code>) is correct and the service is listening on the expected address.</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2 text-red-500 dark:text-red-400 flex-shrink-0">&rarr;</span>
            <span>Inspect the browser's <strong>developer console</strong> (Ctrl+Shift+J or Cmd+Option+J) and the backend service logs for any specific error messages.</span>
          </li>
        </ul>
         <button
            @click="triggerManualHealthCheck"
            class="mt-6 w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-150 flex items-center justify-center text-sm sm:text-base"
          >
            <RotateCcw class="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Retry Connection
          </button>
      </div>
    </div>

  </div>
</template>

<style>
:root {
  --bg: #ffffff;
  --text: #000000;
  --sidebar-text-main: #1f2937;
  --sidebar-text-muted: #6b7280;
}
.dark {
  --bg: #111827;
  --text: #ffffff;
  --sidebar-text-main: #d1d5db;
  --sidebar-text-muted: #9ca3af;
}
body {
  margin: 0;
}

.icon-hover {
  transition: transform 0.2s ease-out;
}
.icon-hover:hover {
  transform: scale(1.1);
}

.anitrunk-width {
  transition-property: width;
}

.status-orb {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.orb-connected {
  background-color: #34d399; /* Tailwind green-400 */
  box-shadow: 0 0 7px 2px #34d399a0;
}
.orb-disconnected {
  background-color: #f87171; /* Tailwind red-400 */
  box-shadow: 0 0 7px 2px #f87171a0;
}

.status-connected-text {
  font-size: 0.875rem; /* text-sm */
  line-height: 1.25rem; /* leading-5 */
  font-weight: 600; /* semibold */
  color: var(--sidebar-text-main);
}

.status-latency-display-text {
  font-size: 0.75rem; /* text-xs */
  line-height: 1rem;  /* leading-4 */
  color: var(--sidebar-text-muted);
}

.fixed-status-item-container .font-medium.text-xs {
    font-weight: 500; /* medium */
    font-size: 1rem; /* Adjusted for your specific style, was text-xs */
    line-height: 1rem;
    color: var(--sidebar-text-main);
}

.min-w-0 { min-width: 0; }
.truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>