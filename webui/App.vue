<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { ref, watchEffect } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'

const isDark = useDark()
const toggleDark = useToggle(isDark)

const isTransitioning = ref(false)
const showContent = ref(true)
const overlayColor = ref('#ffffff')

const handleToggle = () => {
  showContent.value = false
  isTransitioning.value = true
  overlayColor.value = isDark.value ? '#111827' : '#ffffff'
  requestAnimationFrame(() => {
    overlayColor.value = isDark.value ? '#ffffff' : '#111827'
  })

  setTimeout(() => {
    toggleDark()
  }, 500)

  setTimeout(() => {
    isTransitioning.value = false
    showContent.value = true
  }, 800)
}

watchEffect(() => {
  document.documentElement.classList.toggle('dark', isDark.value)
})
</script>

<template>
  <div class="relative min-h-screen overflow-hidden" style="background-color: var(--bg); color: var(--text);">
    <!-- Top-right toggle icon -->
    <div
      class="absolute top-4 right-4 z-20 cursor-pointer transition transform hover:scale-110 group"
      @click="handleToggle"
    >
      <component
        :is="isDark ? Moon : Sun"
        class="w-6 h-6 transition-colors duration-300 text-black dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-300"
      />
    </div>

    <!-- Overlay -->
    <div
      v-if="isTransitioning"
      class="fixed inset-0 z-50 pointer-events-none transition-colors duration-700"
      :style="{ backgroundColor: overlayColor }"
    ></div>

    <!-- Content -->
    <transition name="fade-in" appear>
      <div
        v-if="showContent"
        class="z-10 transition-opacity duration-300 flex items-center justify-center min-h-screen"
      >
        <div class="text-xl text-center">
          Hello, World!
        </div>
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
  --bg: #111827;
  --text: #ffffff;
}

body {
  margin: 0;
  transition: background-color 0.6s ease, color 0.5s ease;
}

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
