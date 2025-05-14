<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { ref, watchEffect, nextTick, onMounted } from 'vue' // Added nextTick, onMounted
import { Sun, Moon, SunMoon, PanelRightOpen, PanelRightClose, Cuboid } from 'lucide-vue-next'

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
// const toggleDark = useToggle(isDark) // Not directly used by handleToggle, but available

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
  // ... (Theme toggling logic - keeping it the same as provided)
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
      // const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches // Not needed for system -> dark
      currentIcon.value = 'moon'
      currentTheme.value = 'dark'
      isDark.value = true // Force dark mode
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
const isSidebarCollapsed = ref(false)    // User's *intent* to have sidebar collapsed or expanded
const showSidebarText = ref(true)        // Controls text visibility in sidebar items for animation
const sidebarWidthClass = ref('w-56')    // Dynamic class for sidebar's actual width
const contentMarginClass = ref('ml-64')  // Dynamic class for main content's margin-left
const isAnimating = ref(false)           // Flag to prevent re-triggering animations

const mainContentEl = ref<HTMLElement | null>(null) // Template ref for the main content div

onMounted(() => {
  // Initialize visual state based on the initial 'isSidebarCollapsed' value
  showSidebarText.value = !isSidebarCollapsed.value;
  sidebarWidthClass.value = isSidebarCollapsed.value ? 'w-14' : 'w-56';
  // Use ml-14 for collapsed state to align with w-14 (3.5rem or 56px)
  contentMarginClass.value = isSidebarCollapsed.value ? 'ml-14' : 'ml-64';
});

const handleSidebarToggle = () => {
  if (isAnimating.value) return;
  isAnimating.value = true;

  const currentlyCollapsed = isSidebarCollapsed.value; // State *before* this toggle action

  if (!currentlyCollapsed) { // Intent: COLLAPSE (Sidebar is currently expanded)
    isSidebarCollapsed.value = true; // Update primary intent state

    // Phase 1: Content slides left. Sidebar itself is still wide with text visible underneath.
    showSidebarText.value = true;     // Keep text visible to be covered
    sidebarWidthClass.value = 'w-56'; // Keep sidebar full width initially

    nextTick(() => { // Ensure DOM has sidebar at w-56 before changing content margin
      contentMarginClass.value = 'ml-14'; // Slide content to cover text part
    });

    const transitionEndHandler = () => {
      if (mainContentEl.value) mainContentEl.value.removeEventListener('transitionend', transitionEndHandler);
      // Phase 2: After content covers, hide text and shrink sidebar's container.
      // Check if the state is still "collapsing" (in case of rapid toggles, though isAnimating should prevent)
      if (isSidebarCollapsed.value) {
        showSidebarText.value = false;    // Now hide the text
        sidebarWidthClass.value = 'w-14'; // And shrink the sidebar container
      }
      isAnimating.value = false;
    };

    if (mainContentEl.value) {
      mainContentEl.value.addEventListener('transitionend', transitionEndHandler, { once: true });
    } else { // Fallback if ref isn't immediately available (should be rare)
      setTimeout(transitionEndHandler, 350); // Duration slightly > transition (300ms)
    }

  } else { // Intent: EXPAND (Sidebar is currently collapsed)
    isSidebarCollapsed.value = false; // Update primary intent state

    // Phase 1: Prepare sidebar: show text, expand width. Content is still overlaying.
    showSidebarText.value = true;
    sidebarWidthClass.value = 'w-56';

    // Phase 2: Content slides right to reveal sidebar.
    // Use nextTick to ensure sidebar DOM updates (width, text visibility) are rendered before content animation.
    nextTick(() => {
      contentMarginClass.value = 'ml-64';

      const transitionEndHandler = () => {
        if (mainContentEl.value) mainContentEl.value.removeEventListener('transitionend', transitionEndHandler);
        isAnimating.value = false;
      };
      if (mainContentEl.value) {
        mainContentEl.value.addEventListener('transitionend', transitionEndHandler, { once: true });
      } else {
        setTimeout(transitionEndHandler, 350);
      }
    });
  }
};
</script>

<template>
  <div class="relative min-h-screen" style="background-color: var(--bg); color: var(--text);">
    <div 
      :class="sidebarWidthClass" 
      class="absolute top-0 left-0 h-full bg-gray-200 dark:bg-gray-800 z-10 transition-all ease-in-out duration-300 overflow-hidden"
    >
      <div class="flex flex-col items-start p-4">
        <div @click="handleSidebarToggle" class="cursor-pointer mb-4">
          <component
            :is="isSidebarCollapsed ? PanelRightClose : PanelRightOpen"
            class="w-6 h-6 text-black dark:text-white"
          />
        </div>
        
        <ul class="space-y-4 w-full">
          <li class="cursor-pointer text-lg hover:text-gray-600 dark:hover:text-gray-300">
            <div v-if="showSidebarText" class="flex items-center">
              <Cuboid class="w-6 h-6 mr-2 flex-shrink-0" /> Tab 1
            </div>
            <Cuboid v-else class="w-6 h-6" />
          </li>
          <li class="cursor-pointer text-lg hover:text-gray-600 dark:hover:text-gray-300">
            <div v-if="showSidebarText" class="flex items-center">
              <Cuboid class="w-6 h-6 mr-2 flex-shrink-0" /> Tab 2
            </div>
            <Cuboid v-else class="w-6 h-6" />
          </li>
          <li class="cursor-pointer text-lg hover:text-gray-600 dark:hover:text-gray-300">
            <div v-if="showSidebarText" class="flex items-center">
              <Cuboid class="w-6 h-6 mr-2 flex-shrink-0" /> Tab 3
            </div>
            <Cuboid v-else class="w-6 h-6" />
          </li>
        </ul>
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

/* Non-linear sidebar transition for width and margin changes */
.transition-all {
  transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1); 
}

/* Ensure sidebar icons don't cause wrap when sidebar is narrow before text hides */
.sidebar-item-text {
  white-space: nowrap;
  overflow: hidden;
}
</style>