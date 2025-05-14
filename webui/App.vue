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
      localStorage.setItem('theme', 'dark') // Fallback to dark
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
      currentIcon.value = 'moon' // Fallback to dark
      currentTheme.value = 'dark'
      isDark.value = true
      localStorage.setItem('theme', 'dark')
    }
  } else if (currentTheme.value === 'system') {
     currentIcon.value = 'moon'
     currentTheme.value = 'dark'
     isDark.value = true
     localStorage.setItem('theme', 'dark')
  } else { // Current is dark
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
const showSidebarText = ref(true)
const sidebarWidthClass = ref('w-56')
const contentMarginClass = ref('ml-64')
const isAnimating = ref(false)
const showGithubIcon = ref(true);
const githubIconCollapseTimer = ref<number | undefined>(undefined);
const githubIconExpandTimer = ref<number | undefined>(undefined);

const mainContentEl = ref<HTMLElement | null>(null)

// --- Backend Connection State & Tooltip ---
const isBackendConnected = ref(false);
const healthCheckInterval = ref<number | undefined>(undefined);
const latencyMs = ref<number | null>(null);
const isConnectionTooltipVisible = ref(false);

function truncate(num: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces);
  return Math.floor(num * factor) / factor;
}

const formattedLatency = computed(() => {
  const ms = latencyMs.value;
  if (ms === null || ms < 0) return null;
  if (ms === 0) return "0ms";

  const ns = ms * 1_000_000;
  if (ms > 0 && ms < 0.001) { // 0 to 999 ns
      return `${Math.floor(ns)}ns`;
  }

  // From here, ms is >= 0.001 (1µs or 1000ns)
  if (ms < 1000) { // 0.001ms to 999.999... ms
    if (ms < 10) { // Target: X.YYms
      const val = truncate(ms, 2);
      return `${val.toFixed(2)}ms`;
    } else if (ms < 100) { // Target: XX.Yms
      const val = truncate(ms, 1);
      return `${val.toFixed(1)}ms`;
    } else { // Target: XXXms
      return `${Math.floor(ms)}ms`;
    }
  } else { // >= 1000ms (1s)
    const s = ms / 1000;
    if (s < 10) { // Target: X.YYs
      const val = truncate(s, 2);
      return `${val.toFixed(2)}s`;
    } else if (s < 100) { // Target: XX.Ys
      const val = truncate(s, 1);
      return `${val.toFixed(1)}s`;
    } else { // Target: XXXs
      return `${Math.floor(s)}s`;
    }
  }
});

const checkBackendStatus = async () => {
  const requestSentTimestamp = Date.now();
  try {
    const response = await fetch('http://localhost:33330/v1/ipelfs/healthcheck');
    if (response.ok) {
      const data = await response.json();
      const newConnectionState = data.success === true;

      if (newConnectionState) {
        try {
          const backendTime = new Date(data.data).getTime();
          if (!isNaN(backendTime)) {
            latencyMs.value = backendTime - requestSentTimestamp;
          } else {
            console.warn("Backend returned invalid timestamp for latency calculation.");
            latencyMs.value = null;
          }
        } catch (e) {
          console.error("Error parsing backend timestamp for latency:", e);
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
  showSidebarText.value = !isSidebarCollapsed.value;
  showGithubIcon.value = !isSidebarCollapsed.value;
  sidebarWidthClass.value = isSidebarCollapsed.value ? 'w-14' : 'w-56';
  contentMarginClass.value = isSidebarCollapsed.value ? 'ml-14' : 'ml-64';

  checkBackendStatus();
  healthCheckInterval.value = window.setInterval(checkBackendStatus, 1000);
});

onUnmounted(() => {
  if (healthCheckInterval.value !== undefined) {
    clearInterval(healthCheckInterval.value);
  }
  if (githubIconCollapseTimer.value !== undefined) clearTimeout(githubIconCollapseTimer.value);
  if (githubIconExpandTimer.value !== undefined) clearTimeout(githubIconExpandTimer.value);
});

const handleSidebarToggle = () => {
  if (isAnimating.value) return;
  isAnimating.value = true;

  if (githubIconCollapseTimer.value !== undefined) clearTimeout(githubIconCollapseTimer.value);
  if (githubIconExpandTimer.value !== undefined) clearTimeout(githubIconExpandTimer.value);
  githubIconCollapseTimer.value = undefined;
  githubIconExpandTimer.value = undefined;

  const currentlyCollapsed = isSidebarCollapsed.value;
  const animationDuration = 300;
  const expandShowEarlyMs = 50;

  if (!currentlyCollapsed) { // Intent: COLLAPSE
    isSidebarCollapsed.value = true;
    showGithubIcon.value = false;

    nextTick(() => {
      contentMarginClass.value = 'ml-14';
    });

    const onCollapseAnimationEnd = () => {
      if (isSidebarCollapsed.value) {
        showSidebarText.value = false;
        sidebarWidthClass.value = 'w-14';
      }
      isAnimating.value = false;
    };
    
    setTimeout(() => {
         if (isSidebarCollapsed.value) showSidebarText.value = false;
    }, animationDuration - 150 > 0 ? animationDuration - 150 : 50);


    if (mainContentEl.value) {
        mainContentEl.value.addEventListener('transitionend', onCollapseAnimationEnd, { once: true });
    } else {
        setTimeout(onCollapseAnimationEnd, animationDuration + 50);
    }
    sidebarWidthClass.value = 'w-14 anitrunk-width';

  } else { // Intent: EXPAND
    isSidebarCollapsed.value = false;
    sidebarWidthClass.value = 'w-56';

    nextTick(() => {
      contentMarginClass.value = 'ml-64';
      setTimeout(() => {
        if(!isSidebarCollapsed.value) showSidebarText.value = true;
      }, 50);


      const showIconTime = animationDuration - expandShowEarlyMs;
      if (showIconTime > 0) {
        githubIconExpandTimer.value = window.setTimeout(() => {
          if (!isSidebarCollapsed.value) {
            showGithubIcon.value = true;
          }
        }, showIconTime);
      } else {
         if (!isSidebarCollapsed.value) showGithubIcon.value = true;
      }
    });

    const onExpandAnimationEnd = () => {
      if (!isSidebarCollapsed.value && !showGithubIcon.value) {
         clearTimeout(githubIconExpandTimer.value);
         githubIconExpandTimer.value = undefined;
         showGithubIcon.value = true;
      }
      if(!isSidebarCollapsed.value) showSidebarText.value = true;
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
      <div class="flex flex-col items-start p-2">
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

      <div
        v-show="showGithubIcon"
        class="absolute top-4 right-4 cursor-pointer"
        @click="openGitHubLink"
        title="Open GitHub Repository"
      >
        <SquareArrowOutUpRight class="w-6 h-6 text-black dark:text-white icon-hover" />
      </div>

      <div
        class="absolute bottom-4 left-4"
        @mouseenter="isConnectionTooltipVisible = true"
        @mouseleave="isConnectionTooltipVisible = false"
      >
        <component
          :is="isBackendConnected ? Server : ServerOff"
          class="w-6 h-6"
          :class="{
            'text-green-600 dark:text-green-500': isBackendConnected,
            'text-red-600 dark:text-red-500': !isBackendConnected
          }"
        />
        <transition name="tooltip-float">
          <div
            v-if="isConnectionTooltipVisible"
            class="custom-tooltip absolute bottom-full left-0 mb-2"
          >
            <div class="flex items-center" :class="{ 'mb-1': isBackendConnected && (formattedLatency || latencyMs === null) }">
              <span class="status-orb" :class="isBackendConnected ? 'orb-connected' : 'orb-disconnected'"></span>
              <span class="ml-2 font-medium">{{ isBackendConnected ? 'Connected' : 'Disconnected' }}</span>
            </div>

            <template v-if="isBackendConnected">
              <div v-if="formattedLatency" class="text-xs">Latency: {{ formattedLatency }}</div>
              <div v-else-if="latencyMs === null && healthCheckInterval" class="text-xs">Latency: Calculating...</div>
            </template>
          </div>
        </transition>
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
  --tooltip-bg-color: #f3f4f6; /* Tailwind gray-100 */
  --tooltip-text-color: #1f2937; /* Tailwind gray-800 */
}
.dark {
  --bg: #111827;
  --text: #ffffff;
  --tooltip-bg-color: #374151; /* Tailwind gray-700 */
  --tooltip-text-color: #d1d5db; /* Tailwind gray-300 */
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

.anitrunk-width { /* Typo from original, kept as is. Consider renaming if it's a custom class. */
  transition-property: width;
}

.custom-tooltip {
  background-color: var(--tooltip-bg-color);
  color: var(--tooltip-text-color);
  padding: 0.625rem; /* 10px */
  border-radius: 0.75rem; /* 12px */
  /* Enhanced shadow */
  box-shadow: 0 12px 20px -4px rgba(0,0,0,0.12), 0 5px 8px -3px rgba(0,0,0,0.1);
  min-width: max-content;
  white-space: nowrap;
  z-index: 50;
  pointer-events: none; /* Important for tooltip not to interfere with mouse events */
}

.custom-tooltip .text-xs {
    font-size: 0.75rem; 
    line-height: 1rem;
}
.custom-tooltip .font-medium {
    font-weight: 500;
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

/* Tooltip animation */
.tooltip-float-enter-active,
.tooltip-float-leave-active {
  transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
}
.tooltip-float-enter-from,
.tooltip-float-leave-to {
  opacity: 0;
  transform: translateY(8px); /* Start slightly lower / End slightly lower */
}
/* .tooltip-float-enter-to, .tooltip-float-leave-from are opacity: 1; transform: translateY(0); by default */

</style>