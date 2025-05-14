<script setup lang="ts">
import { useDark } from '@vueuse/core'
import { ref, watchEffect, nextTick, onMounted, onUnmounted, computed } from 'vue'
import {
  Sun, Moon, SunMoon,
  PanelRightOpen, PanelRightClose,
  Cuboid, SquareArrowOutUpRight,
  Server, ServerOff
} from 'lucide-vue-next'

// --- Theme Initialization ---
const storedTheme = localStorage.getItem('theme')
const isDark = useDark({
  valueDark: 'dark',
  valueLight: '',
  storageKey: null,
  initialValue: (() => {
    if (storedTheme === 'dark') return 'dark'
    if (storedTheme === 'light') return ''
    try {
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return systemIsDark ? 'dark' : ''
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
        isDark.value = systemIsDark
        localStorage.removeItem('theme')
      }
    } catch (e) {
      console.error("Failed to switch theme based on system preference:", e);
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
const isSidebarCollapsed = ref(false)
const showSidebarText = ref(true) // For general sidebar text like Tab 1, Tab 2
const sidebarWidthClass = ref('w-56')
const contentMarginClass = ref('ml-64')
const isAnimating = ref(false)
const showGithubIcon = ref(true);
const githubIconCollapseTimer = ref<number | undefined>(undefined);
const githubIconExpandTimer = ref<number | undefined>(undefined);
const showInlineStatusText = ref(true); // Dedicated ref for bottom status text
const statusTextExpandTimer = ref<number | undefined>(undefined);


const mainContentEl = ref<HTMLElement | null>(null)

// --- Backend Connection State ---
const isBackendConnected = ref(false);
const healthCheckInterval = ref<number | undefined>(undefined);
const latencyMs = ref<number | null>(null);

function truncate(num: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces);
  return Math.floor(num * factor) / factor;
}

const formattedLatency = computed(() => {
  const ms = latencyMs.value;
  if (ms === null || ms < 0) return null;
  if (ms === 0) return "0ms";

  const ns = ms * 1_000_000;
  if (ms > 0 && ms < 0.001) { 
      return `${Math.floor(ns)}ns`;
  }

  if (ms < 1000) { 
    if (ms < 10) { 
      const val = truncate(ms, 2);
      return `${val.toFixed(2)}ms`;
    } else if (ms < 100) { 
      const val = truncate(ms, 1);
      return `${val.toFixed(1)}ms`;
    } else { 
      return `${Math.floor(ms)}ms`;
    }
  } else { 
    const s = ms / 1000;
    if (s < 10) { 
      const val = truncate(s, 2);
      return `${val.toFixed(2)}s`;
    } else if (s < 100) { 
      const val = truncate(s, 1);
      return `${val.toFixed(1)}s`;
    } else { 
      return `${Math.floor(s)}s`;
    }
  }
});

const checkBackendStatus = async () => {
  const requestSentTimestamp = Date.now(); // Milliseconds
  try {
    const response = await fetch('http://localhost:33330/v1/ipelfs/healthcheck');
    if (response.ok) {
      const data = await response.json();
      const newConnectionState = data.success === true;

      if (newConnectionState) {
        try {
          const backendTimestampStr = data.data as string; // e.g., "2025-05-15T01:26:27.828466497+08:00"
          
          const datePart = backendTimestampStr.substring(0, 19); // "2025-05-15T01:26:27"
          const fractionalPartMatch = backendTimestampStr.match(/\.(\d+)/);
          // Gracefully find timezone part, handling 'Z' or +/-HH:mm
          let timezonePart = "Z"; // Default to UTC if no explicit offset found after fractional seconds
          const timezoneMatch = backendTimestampStr.substring(19).match(/[Z+-].*$/);
          if (timezoneMatch) {
            timezonePart = timezoneMatch[0];
          }
          
          let backendEpochNs: bigint;
          const baseMsBigInt = BigInt(new Date(datePart + timezonePart).getTime());

          if (fractionalPartMatch && fractionalPartMatch[1]) {
              let nanoStr = fractionalPartMatch[1]; 
              if (nanoStr.length > 9) nanoStr = nanoStr.substring(0, 9);
              else if (nanoStr.length < 9) nanoStr = nanoStr.padEnd(9, '0');
              const nanoseconds = BigInt(nanoStr);
              backendEpochNs = baseMsBigInt * 1_000_000n + nanoseconds;
          } else {
              backendEpochNs = baseMsBigInt * 1_000_000n; 
          }
          
          const requestSentEpochNs = BigInt(requestSentTimestamp) * 1_000_000n;
          const latencyNanos = backendEpochNs - requestSentEpochNs;
          latencyMs.value = Number(latencyNanos) / 1_000_000.0;

        } catch (e) {
          console.error("Error parsing backend timestamp or calculating latency:", e);
          latencyMs.value = null;
        }
        isBackendConnected.value = true;
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

onMounted(() => {
  const initialSidebarState = isSidebarCollapsed.value;
  showSidebarText.value = !initialSidebarState;
  showGithubIcon.value = !initialSidebarState;
  showInlineStatusText.value = !initialSidebarState; // Initialize based on sidebar state
  sidebarWidthClass.value = initialSidebarState ? 'w-14' : 'w-56';
  contentMarginClass.value = initialSidebarState ? 'ml-14' : 'ml-64';

  checkBackendStatus();
  healthCheckInterval.value = window.setInterval(checkBackendStatus, 1000);
});

onUnmounted(() => {
  if (healthCheckInterval.value !== undefined) {
    clearInterval(healthCheckInterval.value);
  }
  if (githubIconCollapseTimer.value !== undefined) clearTimeout(githubIconCollapseTimer.value);
  if (githubIconExpandTimer.value !== undefined) clearTimeout(githubIconExpandTimer.value);
  if (statusTextExpandTimer.value !== undefined) clearTimeout(statusTextExpandTimer.value);
});

const handleSidebarToggle = () => {
  if (isAnimating.value) return;
  isAnimating.value = true;

  // Clear all animation timers
  if (githubIconCollapseTimer.value !== undefined) clearTimeout(githubIconCollapseTimer.value);
  if (githubIconExpandTimer.value !== undefined) clearTimeout(githubIconExpandTimer.value);
  if (statusTextExpandTimer.value !== undefined) clearTimeout(statusTextExpandTimer.value);
  githubIconCollapseTimer.value = undefined;
  githubIconExpandTimer.value = undefined;
  statusTextExpandTimer.value = undefined;


  const currentlyCollapsed = isSidebarCollapsed.value;
  const animationDuration = 300;
  const expandShowEarlyMs = 50; // How early to show elements during expansion

  if (!currentlyCollapsed) { // Intent: COLLAPSE
    isSidebarCollapsed.value = true;
    showGithubIcon.value = false; // Hide GitHub icon immediately
    showInlineStatusText.value = false; // Hide inline status text immediately

    nextTick(() => {
      contentMarginClass.value = 'ml-14';
    });

    // General sidebar text (Tabs) hides later in the animation
    const generalTextHideDelay = animationDuration - 150 > 0 ? animationDuration - 150 : 50;
    setTimeout(() => {
         if (isSidebarCollapsed.value) showSidebarText.value = false;
    }, generalTextHideDelay);

    const onCollapseAnimationEnd = () => {
      if (isSidebarCollapsed.value) {
        // showSidebarText.value = false; // Already handled by timeout
        sidebarWidthClass.value = 'w-14';
      }
      isAnimating.value = false;
    };
    
    if (mainContentEl.value) {
        mainContentEl.value.addEventListener('transitionend', onCollapseAnimationEnd, { once: true });
    } else {
        setTimeout(onCollapseAnimationEnd, animationDuration + 50);
    }
    sidebarWidthClass.value = 'w-14 anitrunk-width';

  } else { // Intent: EXPAND
    isSidebarCollapsed.value = false;
    sidebarWidthClass.value = 'w-56'; // Start expanding width

    nextTick(() => {
      contentMarginClass.value = 'ml-64';
      
      // General sidebar text (Tabs) shows early
      setTimeout(() => {
        if(!isSidebarCollapsed.value) showSidebarText.value = true; 
      }, 50);

      // GitHub icon shows with its specific timing
      const showIconTime = animationDuration - expandShowEarlyMs;
      if (showIconTime > 0) {
        githubIconExpandTimer.value = window.setTimeout(() => {
          if (!isSidebarCollapsed.value) showGithubIcon.value = true;
        }, showIconTime);
      } else {
         if (!isSidebarCollapsed.value) showGithubIcon.value = true;
      }

      // Inline status text also shows with similar timing logic
      // (can use same delay as icon or adjust if needed)
      const showStatusTextTime = animationDuration - expandShowEarlyMs + 20; // e.g. slightly after icon
       if (showStatusTextTime > 0) {
        statusTextExpandTimer.value = window.setTimeout(() => {
          if (!isSidebarCollapsed.value) showInlineStatusText.value = true;
        }, showStatusTextTime);
      } else {
         if (!isSidebarCollapsed.value) showInlineStatusText.value = true;
      }
    });

    const onExpandAnimationEnd = () => {
      // Fallback to ensure elements are visible if timers somehow failed or animation ended prematurely
      if (!isSidebarCollapsed.value) {
        if (!showGithubIcon.value) showGithubIcon.value = true;
        if (!showInlineStatusText.value) showInlineStatusText.value = true;
        if (!showSidebarText.value) showSidebarText.value = true;
      }
      isAnimating.value = false;
    };
    
    if (mainContentEl.value) {
        mainContentEl.value.addEventListener('transitionend', onExpandAnimationEnd, { once: true });
    } else {
        setTimeout(onExpandAnimationEnd, animationDuration + 50); 
    }
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
                    <span v-else-if="latencyMs === null && healthCheckInterval" class="status-latency-display-text">Calculating...</span>
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
  background-color: #34d399; 
  box-shadow: 0 0 7px 2px #34d399a0;
}
.orb-disconnected {
  background-color: #f87171; 
  box-shadow: 0 0 7px 2px #f87171a0;
}

.status-connected-text {
  font-size: 0.875rem; 
  line-height: 1.25rem; 
  font-weight: 600; 
  color: var(--sidebar-text-main); 
}

.status-latency-display-text {
  font-size: 0.75rem; 
  line-height: 1rem;  /* Default line height for xs font */
  color: var(--sidebar-text-muted); 
}

/* For "Disconnected" text and general text sizing in status item if not directly using Tailwind */
.fixed-status-item-container .font-medium.text-xs {
    font-weight: 500;
    font-size: 1rem;
    line-height: 1rem;
    color: var(--sidebar-text-main); 
}

.min-w-0 {
    min-width: 0;
}
.truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>