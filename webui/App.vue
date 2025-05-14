<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { ref, watchEffect } from 'vue'
import { Sun, Moon, SunMoon } from 'lucide-vue-next'

// Initialize theme
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
const toggleDark = useToggle(isDark)

// Track current icon and theme state
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
    // Current is light, check system preference
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
    // Current is system, check system preference
    try {
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches
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
  } else {
    // Current is dark, switch to light
    currentIcon.value = 'sun'
    currentTheme.value = 'light'
    isDark.value = false
    localStorage.setItem('theme', 'light')
  }
}

watchEffect(() => {
  document.documentElement.classList.toggle('dark', isDark.value)
})
</script>

<template>
  <div class="relative min-h-screen" style="background-color: var(--bg); color: var(--text);">
    <!-- Left Sidebar -->
    <div class="absolute top-0 left-0 h-full w-64 bg-gray-200 dark:bg-gray-800">
      <div class="p-4">
        <ul class="space-y-4">
          <li class="cursor-pointer text-lg hover:text-gray-600 dark:hover:text-gray-300">Tab 1</li>
          <li class="cursor-pointer text-lg hover:text-gray-600 dark:hover:text-gray-300">Tab 2</li>
          <li class="cursor-pointer text-lg hover:text-gray-600 dark:hover:text-gray-300">Tab 3</li>
        </ul>
      </div>
    </div>

    <!-- Top-right toggle icon -->
    <div class="absolute top-4 right-4 z-20 cursor-pointer" @click="handleToggle">
      <component
        :is="currentIcon === 'sun' ? Sun : currentIcon === 'moon' ? Moon : SunMoon"
        class="w-6 h-6 text-black dark:text-white icon-hover"
      />
    </div>

    <!-- Content -->
    <div class="flex items-center justify-center min-h-screen ml-64">
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
</style>
