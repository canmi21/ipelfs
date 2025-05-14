<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { ref, watchEffect, nextTick, onMounted } from 'vue'
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

const mainContentEl = ref<HTMLElement | null>(null)

onMounted(() => {
  showSidebarText.value = !isSidebarCollapsed.value;
  sidebarWidthClass.value = isSidebarCollapsed.value ? 'w-14' : 'w-56';
  contentMarginClass.value = isSidebarCollapsed.value ? 'ml-14' : 'ml-64';
});

const handleSidebarToggle = () => {
  if (isAnimating.value) return;
  isAnimating.value = true;

  const currentlyCollapsed = isSidebarCollapsed.value;

  if (!currentlyCollapsed) { // Intent: COLLAPSE
    isSidebarCollapsed.value = true;
    // For collapse animation, text should be visible initially to be covered
    // And sidebar should be wide to allow content to slide over text
    showSidebarText.value = true; 
    sidebarWidthClass.value = 'w-56';

    nextTick(() => {
      contentMarginClass.value = 'ml-14';
    });

    const transitionEndHandler = () => {
      if (mainContentEl.value) mainContentEl.value.removeEventListener('transitionend', transitionEndHandler);
      // Only fully collapse (hide text, shrink sidebar) if still in collapsed state
      if (isSidebarCollapsed.value) { 
        showSidebarText.value = false;
        sidebarWidthClass.value = 'w-14';
      }
      isAnimating.value = false;
    };

    if (mainContentEl.value) {
      mainContentEl.value.addEventListener('transitionend', transitionEndHandler, { once: true });
    } else {
      setTimeout(transitionEndHandler, 350); // Fallback
    }

  } else { // Intent: EXPAND
    isSidebarCollapsed.value = false;
    // For expand animation, text should appear first, sidebar widens
    showSidebarText.value = true;
    sidebarWidthClass.value = 'w-56';

    nextTick(() => { // Ensure DOM updates for sidebar are processed
      contentMarginClass.value = 'ml-64'; // Then slide content
      const transitionEndHandler = () => {
        if (mainContentEl.value) mainContentEl.value.removeEventListener('transitionend', transitionEndHandler);
        isAnimating.value = false;
      };
      if (mainContentEl.value) {
        mainContentEl.value.addEventListener('transitionend', transitionEndHandler, { once: true });
      } else {
        setTimeout(transitionEndHandler, 350); // Fallback
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
      <div class="flex flex-col items-start p-4"> <div @click="handleSidebarToggle" class="cursor-pointer mb-4">
          <component
            :is="isSidebarCollapsed ? PanelRightClose : PanelRightOpen"
            class="w-6 h-6 text-black dark:text-white icon-hover" 
          />
        </div>
        
        <ul class="space-y-2 w-full">
          <li class="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md">
            <div class="flex items-center h-12"> <Cuboid class="w-6 h-6 flex-shrink-0" /> <span v-if="showSidebarText" class="text-lg truncate ml-3">Tab 1</span> </div>
          </li>
          <li class="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md">
            <div class="flex items-center h-12">
              <Cuboid class="w-6 h-6 flex-shrink-0" />
              <span v-if="showSidebarText" class="text-lg truncate ml-3">Tab 2</span>
            </div>
          </li>
          <li class="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 rounded-md">
            <div class="flex items-center h-12">
              <Cuboid class="w-6 h-6 flex-shrink-0" />
              <span v-if="showSidebarText" class="text-lg truncate ml-3">Tab 3</span>
            </div>
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

.transition-all {
  transition-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1); 
}
</style>