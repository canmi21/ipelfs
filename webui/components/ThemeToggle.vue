<script setup lang="ts">
import { Sun, Moon, SunMoon } from 'lucide-vue-next'
import { useTheme } from './../composables/useTheme'

const { currentIcon, handleToggle } = useTheme()
</script>

<template>
  <div
    class="absolute top-4 right-4 z-40 cursor-pointer p-1.5 rounded-md group"
    @click="handleToggle"
    title="Toggle Theme"
  >
    <component
      :is="currentIcon === 'sun' ? Sun : currentIcon === 'moon' ? Moon : SunMoon"
      class="w-6 h-6 text-icon-muted group-hover:text-icon-accent transform transition-all duration-150 group-hover:scale-110"
    />
  </div>
</template>

<style scoped>
/* Add any specific styles for ThemeToggle if needed, otherwise rely on global styles from main.css */
.text-icon-muted {
  color: var(--icon-muted-color);
}
.group:hover .group-hover\:text-icon-accent {
  color: var(
    --icon-accent-color
  ) !important; /* Important might be needed to override utility classes if not configured for var() */
}
</style>
