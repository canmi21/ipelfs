<script setup lang="ts">
import { useDark } from '@vueuse/core' // useToggle was not used, removed
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
  storageKey: null, // Managed manually to allow 'system'
  initialValue: (() => {
    if (storedTheme === 'dark') return 'dark'
    if (storedTheme === 'light') return ''
    try {
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return systemIsDark ? 'dark' : ''
    } catch {
      localStorage.setItem('theme', 'dark') // Fallback if matchMedia fails
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
  if (currentTheme.value === 'light') { // Light -> try System or Dark
    try {
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (!systemIsDark) { // System is Light, so next is Dark
        currentIcon.value = 'moon'
        currentTheme.value = 'dark'
        isDark.value = true
        localStorage.setItem('theme', 'dark')
      } else { // System is Dark, so next is System
        currentIcon.value = 'sun-moon'
        currentTheme.value = 'system'
        isDark.value = systemIsDark
        localStorage.removeItem('theme')
      }
    } catch { // Fallback to Dark if matchMedia fails
      currentIcon.value = 'moon'
      currentTheme.value = 'dark'
      isDark.value = true
      localStorage.setItem('theme', 'dark')
    }
  } else if (currentTheme.value === 'system') { // System -> Dark
     currentIcon.value = 'moon'
     currentTheme.value = 'dark'
     isDark.value = true
     localStorage.setItem('theme', 'dark')
  } else { // Current is dark -> Light
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
const connectionEstablishedTime = ref<number | null>(null);
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
  // Technically, 0 to 999,999 ns is < 1ms.
  // If ms is 0.0005 (500ns), ns is 500.
  // If ms is 0.000999 (999ns), ns is 999.
  if (ms > 0 && ms < 0.001) { // between 0ns (exclusive) and 1000ns (exclusive)
      return `${Math.floor(ns)}ns`;
  }
  // From here, ms is >= 0.001 (1µs or 1000ns) or ms is 0.
  // The case ms = 0 is handled. If ms is exactly 0.001, ns is 1000.

  if (ms < 1000) { // 0.001ms to 999.999... ms
    if (ms < 10) { // e.g., 1.23ms, 9.99ms. Target: X.YYms
      // For values like 0.001ms, truncate(0.001, 2) is 0. toFixed(2) is "0.00"
      const val = truncate(ms, 2);
      return `${val.toFixed(2)}ms`;
    } else if (ms < 100) { // e.g., 12.3ms, 99.9ms. Target: XX.Yms
      const val = truncate(ms, 1);
      return `${val.toFixed(1)}ms`;
    } else { // e.g., 123ms, 999ms. Target: XXXms
      return `${Math.floor(ms)}ms`;
    }
  } else { // >= 1000ms (1s)
    const s = ms / 1000;
    if (s < 10) { // e.g., 1.23s, 9.99s. Target: X.YYs
      const val = truncate(s, 2);
      return `${val.toFixed(2)}s`;
    } else if (s < 100) { // e.g., 12.3s, 99.9s. Target: XX.Ys
      const val = truncate(s, 1);
      return `${val.toFixed(1)}s`;
    } else { // e.g., 123s. Target: XXXs
      return `${Math.floor(s)}s`;
    }
  }
});

const formattedUptime = computed(() => {
  if (!isBackendConnected.value || connectionEstablishedTime.value === null) {
    return null;
  }
  const now = Date.now();
  const diffMs = now - connectionEstablishedTime.value;
  if (diffMs < 0) return null;

  let totalSeconds = Math.floor(diffMs / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
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
          const backendTime = new Date(data.data).getTime(); // "2025-05-15T01:26:27.828466497+08:00"
          if (!isNaN(backendTime)) {
            latencyMs.value = backendTime - requestSentTimestamp;
          } else {
            latencyMs.value = null; // Or RTT: Date.now() - requestSentTimestamp;
          }
        } catch (e) {
          console.error("Error parsing backend timestamp for latency:", e);
          latencyMs.value = null;
        }

        if (!isBackendConnected.value) { // Was false, now true
          connectionEstablishedTime.value = Date.now(); // Record time of connection
        }
      } else { // response.ok but data.success is false
        latencyMs.value = null;
        if (isBackendConnected.value) { // Was true, now false
            connectionEstablishedTime.value = null;
        }
      }
      isBackendConnected.value = newConnectionState;

    } else { // response not ok (e.g. 404, 500)
      if (isBackendConnected.value) { // Was true, now false
        connectionEstablishedTime.value = null;
      }
      isBackendConnected.value = false;
      latencyMs.value = null;
    }
  } catch (error) { // fetch error (network issue, server down)
    if (isBackendConnected.value) { // Was true, now false
      connectionEstablishedTime.value = null;
    }
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
  // const collapseHideDelay = 75; // Not directly used in this simplified example
  const expandShowEarlyMs = 50;

  if (!currentlyCollapsed) { // Intent: COLLAPSE
    isSidebarCollapsed.value = true;
    showGithubIcon.value = false; // Hide immediately or animate out
    // showSidebarText.value = true; // Text remains visible during collapse width transition
    // sidebarWidthClass.value = 'w-56'; // Start from expanded

    nextTick(() => {
      contentMarginClass.value = 'ml-14';
      // sidebarWidthClass.value = 'w-14'; // This should transition
    });

    const onCollapseAnimationEnd = () => {
      if (isSidebarCollapsed.value) { // Check if still collapsing
        showSidebarText.value = false;
        sidebarWidthClass.value = 'w-14'; // Final state after text hidden
        // if (showGithubIcon.value) showGithubIcon.value = false; // Ensure it's hidden
      }
      isAnimating.value = false;
    };
    
    // For smooth text hiding, apply final width AFTER text is hidden (or just rely on overflow:hidden)
    // This part relies on CSS transition on sidebarWidthClass and contentMarginClass
    // We'll set the final width and hide text after the transition of margin is expected to finish
    // A more robust way would be to chain animations or use a library
    setTimeout(() => { // Hide text slightly before full collapse visually
         if (isSidebarCollapsed.value) showSidebarText.value = false;
    }, animationDuration - 150 > 0 ? animationDuration - 150 : 50);


    if (mainContentEl.value) {
        mainContentEl.value.addEventListener('transitionend', onCollapseAnimationEnd, { once: true });
    } else {
        setTimeout(onCollapseAnimationEnd, animationDuration + 50); // Fallback
    }
    // Start width transition immediately for sidebar
    sidebarWidthClass.value = 'w-14 anitrunk-width'; // Add a class to only animate width, not other properties if needed

  } else { // Intent: EXPAND
    isSidebarCollapsed.value = false;
    // showSidebarText.value = true; // Show text immediately or after a slight delay
    sidebarWidthClass.value = 'w-56'; // Start expanding sidebar width

    nextTick(() => {
      contentMarginClass.value = 'ml-64';
      // Show text a bit before full expansion for smoother feel
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
      if (!isSidebarCollapsed.value && !showGithubIcon.value) { // If somehow icon didn't show
         clearTimeout(githubIconExpandTimer.value);
         githubIconExpandTimer.value = undefined;
         showGithubIcon.value = true;
      }
      if(!isSidebarCollapsed.value) showSidebarText.value = true; // Ensure text is visible
      isAnimating.value = false;
    };
    
    if (mainContentEl.value) {
        mainContentEl.value.addEventListener('transitionend', onExpandAnimationEnd, { once: true });
    } else {
        setTimeout(onExpandAnimationEnd, animationDuration + 50); // Fallback
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
            :class="{
              'hover:bg-gray-300 dark:hover:bg-gray-700': showSidebarText
            }"
          >
            <div class="flex items-center h-10 px-2">
              <Cuboid
                class="w-6 h-6 flex-shrink-0"
                :class="{ 'icon-hover': !showSidebarText }"
              />
              <span v-if="showSidebarText" class="text-lg truncate ml-3">Tab 1</span>
            </div>
          </li>
          <li
            class="cursor-pointer rounded-md"
            :class="{
              'hover:bg-gray-300 dark:hover:bg-gray-700': showSidebarText
            }"
          >
            <div class="flex items-center h-10 px-2">
              <Cuboid
                class="w-6 h-6 flex-shrink-0"
                :class="{ 'icon-hover': !showSidebarText }"
              />
              <span v-if="showSidebarText" class="text-lg truncate ml-3">Tab 2</span>
            </div>
          </li>
          <li
            class="cursor-pointer rounded-md"
            :class="{
              'hover:bg-gray-300 dark:hover:bg-gray-700': showSidebarText
            }"
          >
            <div class="flex items-center h-10 px-2">
              <Cuboid
                class="w-6 h-6 flex-shrink-0"
                :class="{ 'icon-hover': !showSidebarText }"
              />
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
          class="w-6 h-6" :class="{
            'text-green-600 dark:text-green-500': isBackendConnected,
            'text-red-600 dark:text-red-500': !isBackendConnected
          }"
        />
        <div
          v-if="isConnectionTooltipVisible"
          class="custom-tooltip absolute bottom-full left-0 mb-2"
        >
          <div class="font-semibold mb-1">Connection Status</div>
          <div>State:
            <span :class="isBackendConnected ? 'text-green-400 dark:text-green-300' : 'text-red-400 dark:text-red-300'">
              {{ isBackendConnected ? 'Connected' : 'Disconnected' }}
            </span>
          </div>
          <template v-if="isBackendConnected">
            <div v-if="formattedUptime">Uptime: {{ formattedUptime }}</div>
            <div v-if="formattedLatency">Latency: {{ formattedLatency }}</div>
            <div v-else-if="latencyMs === null">Latency: Calculating...</div>
          </template>
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
  /* Tooltip for light theme: darkish background, light text */
  --tooltip-bg-color: #2d3748; /* Example: Tailwind gray-800 */
  --tooltip-text-color: #f7fafc; /* Example: Tailwind gray-100 */
}
.dark {
  --bg: #111827; /* Example: Tailwind gray-900 */
  --text: #ffffff;
  /* Tooltip for dark theme: lightish background, dark text */
  --tooltip-bg-color: #edf2f7; /* Example: Tailwind gray-200 */
  --tooltip-text-color: #1a202c; /* Example: Tailwind gray-900 */
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

.transition-all {
  /* transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1); */ /* Original - can be kept */
  /* Using Tailwind's default ease-in-out for consistency if not specifically overridden */
}

.anitrunk-width { /* Helper for sidebar collapse/expand to target width specifically if needed */
  transition-property: width;
}

.custom-tooltip {
  background-color: var(--tooltip-bg-color);
  color: var(--tooltip-text-color);
  padding: 0.75rem; /* p-3 */
  border-radius: 0.5rem; /* rounded-lg */
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); /* shadow-xl like */
  min-width: max-content; /* w-auto min-w-max */
  /* width: max-content; */ /* Ensure it doesn't wrap too early */
  white-space: nowrap; /* Prevent wrapping for short lines */
  z-index: 50; /* Ensure it's above other elements */
  pointer-events: none; /* So it doesn't interfere with mouse events on elements below if slightly offset */
}

/* Small adjustment for tooltip text colors within the tooltip if they are fixed and not inheriting */
.custom-tooltip .text-green-400 { color: #48bb78; } /* Tailwind green-400 */
.dark .custom-tooltip .text-green-300 { color: #68d391; } /* Tailwind green-300 for dark theme */
.custom-tooltip .text-red-400 { color: #f56565; } /* Tailwind red-400 */
.dark .custom-tooltip .text-red-300 { color: #fc8181; } /* Tailwind red-300 for dark theme */

</style>