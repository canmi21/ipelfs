<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { ref, watchEffect, nextTick, onMounted } from 'vue'
import { 
  Sun, Moon, SunMoon, 
  PanelRightOpen, PanelRightClose, 
  Cuboid, SquareArrowOutUpRight 
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
    } catch {
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
    } catch {
      currentIcon.value = 'moon'
      currentTheme.value = 'dark'
      isDark.value = true
      localStorage.setItem('theme', 'dark')
    }
  } else if (currentTheme.value === 'system') {
    try {
      currentIcon.value = 'moon'
      currentTheme.value = 'dark'
      isDark.value = true
      localStorage.setItem('theme', 'dark')
    } catch {
      currentIcon.value = 'moon'
      currentTheme.value = 'dark'
      isDark.value = true
      localStorage.setItem('theme', 'dark')
    }
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

onMounted(() => {
  showSidebarText.value = !isSidebarCollapsed.value;
  showGithubIcon.value = !isSidebarCollapsed.value;
  sidebarWidthClass.value = isSidebarCollapsed.value ? 'w-14' : 'w-56';
  contentMarginClass.value = isSidebarCollapsed.value ? 'ml-14' : 'ml-64';
});

const handleSidebarToggle = () => {
  if (isAnimating.value) return;
  isAnimating.value = true;

  if (githubIconCollapseTimer.value !== undefined) clearTimeout(githubIconCollapseTimer.value);
  if (githubIconExpandTimer.value !== undefined) clearTimeout(githubIconExpandTimer.value);
  githubIconCollapseTimer.value = undefined;
  githubIconExpandTimer.value = undefined;

  const currentlyCollapsed = isSidebarCollapsed.value;
  const animationDuration = 300; // from duration-300
  const collapseHideDelay = 75;   // Hide GitHub icon 75ms after content starts sliding over
  const expandShowEarlyMs = 50;   // Show GitHub icon 50ms before content finishes sliding away

  if (!currentlyCollapsed) { // Intent: COLLAPSE
    isSidebarCollapsed.value = true; // Update intent
    // showGithubIcon remains true initially
    showSidebarText.value = true; 
    sidebarWidthClass.value = 'w-56';

    nextTick(() => {
      contentMarginClass.value = 'ml-14'; // Content starts sliding over
      
      githubIconCollapseTimer.value = window.setTimeout(() => {
        if (isSidebarCollapsed.value) { // Only hide if still collapsing
          showGithubIcon.value = false;
        }
      }, collapseHideDelay);
    });

    const onCollapseAnimationEnd = () => {
      if (isSidebarCollapsed.value) { // Final state check
        showSidebarText.value = false;
        sidebarWidthClass.value = 'w-14';
        // Ensure GitHub icon is hidden if the timer didn't catch it or state changed
        if (showGithubIcon.value) {
            clearTimeout(githubIconCollapseTimer.value);
            githubIconCollapseTimer.value = undefined;
            showGithubIcon.value = false;
        }
      }
      isAnimating.value = false;
    };

    if (mainContentEl.value) {
      mainContentEl.value.addEventListener('transitionend', onCollapseAnimationEnd, { once: true });
    } else {
      setTimeout(onCollapseAnimationEnd, animationDuration + 50); // Fallback
    }

  } else { // Intent: EXPAND
    isSidebarCollapsed.value = false; // Update intent
    // showGithubIcon remains false initially
    showSidebarText.value = true;
    sidebarWidthClass.value = 'w-56';

    nextTick(() => { 
      contentMarginClass.value = 'ml-64'; // Content starts sliding away
      
      const showTime = animationDuration - expandShowEarlyMs;
      if (showTime > 0) {
        githubIconExpandTimer.value = window.setTimeout(() => {
          if (!isSidebarCollapsed.value) { // Only show if still expanding
            showGithubIcon.value = true;
          }
        }, showTime);
      } else { // Fallback if calculated showTime is not positive
         if (!isSidebarCollapsed.value) showGithubIcon.value = true;
      }
    });

    const onExpandAnimationEnd = () => {
      // Ensure GitHub icon is shown if timer missed or state changed
      if (!isSidebarCollapsed.value && !showGithubIcon.value) {
         clearTimeout(githubIconExpandTimer.value);
         githubIconExpandTimer.value = undefined;
         showGithubIcon.value = true;
      }
      isAnimating.value = false;
    };
    
    if (mainContentEl.value) {
      mainContentEl.value.addEventListener('transitionend', onExpandAnimationEnd, { once: true });
    } else {
      setTimeout(onExpandAnimationEnd, animationDuration + 50); // Fallback
    }
  }
};

// --- GitHub Link Handler ---
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
}
.dark {
  --bg: #111827;
  --text: #ffffff;
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
  transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1); 
}
</style>