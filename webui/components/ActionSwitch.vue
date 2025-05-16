// webui/components/ActionSwitch.vue
<script setup lang="ts">
import type { Component as VueComponent } from 'vue'

const props = defineProps<{
  iconComponent: VueComponent | string
  iconClass?: string // This can still be used for non-color classes or very specific overrides
  title?: string
  onToggle: () => void
}>()
</script>

<template>
  <button
    @click="props.onToggle"
    :title="props.title"
    type="button"
    class="p-1.5 rounded-md group transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-main-content)] dark:focus-visible:ring-offset-[var(--action-switch-dark-offset-bg,var(--bg-main-content))]"
    :style="{ color: 'var(--icon-muted-color)' }"
    aria-label="Action switch"
  >
    <component
      :is="props.iconComponent"
      class="w-6 h-6 transform transition-transform duration-150 group-hover:scale-110"
      :class="[props.iconClass]"
    />
  </button>
</template>

<style scoped>
/* Icon color change on hover and keyboard focus */
button:hover > :deep(svg),
button:focus-visible > :deep(svg) {
  color: var(--icon-accent-color);
}
</style>
