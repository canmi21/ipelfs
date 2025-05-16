<script setup lang="ts">
import type { Component as VueComponent } from 'vue'

const props = defineProps<{
  // These props will come from the SwitchContainer iterating over SwitchConfig objects
  iconComponent: VueComponent | string
  iconClass?: string
  title?: string
  onToggle: () => void
}>()
</script>

<template>
  <button
    @click="props.onToggle"
    :title="props.title"
    type="button"
    class="p-1.5 rounded-md group transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-800 dark:focus-visible:ring-blue-600"
    :style="{ color: 'var(--icon-muted-color)' }"
    aria-label="Action switch"
  >
    <component
      :is="props.iconComponent"
      class="w-6 h-6 transform transition-transform duration-150 group-hover:scale-110"
      :class="[props.iconClass, '!group-hover:text-[var(--icon-accent-color)]']"
    />
  </button>
</template>

<style scoped>
/* Minimal styles, mostly relying on Tailwind and theme variables */

/* Icon color change on hover (applies to mouse users) */
button:hover > :deep(svg) {
  color: var(--icon-accent-color);
}

/* Icon color change on focus.
  This will apply for both mouse clicks (which set focus) and keyboard focus.
  If you want this *only* for keyboard focus, change to:
  button:focus-visible > :deep(svg) { ... }
*/
button:focus > :deep(svg) {
  color: var(--icon-accent-color);
}
</style>
