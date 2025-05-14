<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { ref, watchEffect } from 'vue'

const isDark = useDark()
const toggleDark = useToggle(isDark)

const isTransitioning = ref(false)
const showContent = ref(true)
const overlayColor = ref('#ffffff')

// Toggle dark mode and handle overlay transitions
const handleToggle = () => {
  // Immediately hide content and show the overlay
  showContent.value = false
  isTransitioning.value = true

  // Set initial overlay color
  overlayColor.value = isDark.value ? '#111827' : '#ffffff'
  requestAnimationFrame(() => {
    overlayColor.value = isDark.value ? '#ffffff' : '#111827'
  })

  // Switch theme slightly before the overlay disappears
  setTimeout(() => {
    toggleDark()
  }, 500)

  // Delay restoring content and fade in with overlay
  setTimeout(() => {
    isTransitioning.value = false
    showContent.value = true
  }, 800)
}

// Ensure the 'dark' class is toggled on the <html> element
watchEffect(() => {
  document.documentElement.classList.toggle('dark', isDark.value)
})
</script>

<template>
  <div class="relative min-h-screen flex items-center justify-center overflow-hidden" style="background-color: var(--bg); color: var(--text);">
    
    <!-- Overlay layer with transition -->
    <div
      v-if="isTransitioning"
      class="fixed inset-0 z-50 pointer-events-none transition-colors duration-700"
      :style="{ backgroundColor: overlayColor }"
    ></div>

    <!-- Content area -->
    <transition name="fade-in" appear>
      <div
        v-if="showContent"
        class="z-10 transition-opacity duration-300 flex items-center justify-center"
      >
        <button
          @click="handleToggle"
          class="px-4 py-2 border rounded transition duration-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {{ isDark ? '🌙 Dark Mode' : '☀️ Light Mode' }}
        </button>
      </div>
    </transition>
  </div>
</template>

<style>
:root {
  --bg: #ffffff;
  --text: #000000;
}
.dark {
  --bg: #111827; /* Dark gray background */
  --text: #ffffff;
}

body {
  margin: 0;
  transition: background-color 0.6s ease, color 0.5s ease;
}

/* Fade-in effect for content */
.fade-in-enter-active {
  transition: opacity 0.2s ease;
}
.fade-in-leave-active {
  transition: opacity 0.1s ease;
}
.fade-in-enter-from,
.fade-in-leave-to {
  opacity: 0;
}
</style>
