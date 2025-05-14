<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { useDark, useToggle } from '@vueuse/core'
import { watchEffect } from 'vue'

const isDark = useDark()
const toggleDark = useToggle(isDark)

watchEffect(() => {
  document.documentElement.classList.toggle('dark', isDark.value)
})
</script>

<template>
  <div class="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition">
    <header class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="text-lg font-bold">ipelfs Dashboard</div>
      <div class="flex items-center gap-4 text-sm">
        <RouterLink to="/" class="hover:underline">Home</RouterLink>
        <RouterLink to="/about" class="hover:underline">About</RouterLink>
        <button @click="toggleDark()" class="px-3 py-1 border rounded">
          {{ isDark ? '🌙 Dark' : '☀️ Light' }}
        </button>
      </div>
    </header>

    <main class="p-6">
      <RouterView />
      <div class="text-red-500">调试：App.vue 加载了</div>
    </main>

  </div>
</template>

<style scoped>
html, body {
  transition: background-color 0.3s, color 0.3s;
}
</style>
