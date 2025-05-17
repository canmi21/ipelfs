<script setup lang="ts">
import { computed } from 'vue'
import type { Component as VueComponent } from 'vue'

const props = defineProps<{
  iconComponent: VueComponent | string
  iconClass?: string
  title?: string
  onToggle: () => void
}>()

const buttonFocusStyle = computed(() => ({
  color: 'var(--icon-muted-color)',
  '--focus-ring-width': '1px',
  '--focus-ring-offset-width': '0px',
  '--focus-ring-offset-color': 'var(--sidebar-bg)',
}))
</script>

<template>
  <button
    @click="props.onToggle"
    :title="props.title"
    type="button"
    class="p-0.5 rounded-md group transition-colors duration-150 ease-in-out focusable-ui-element"
    :style="buttonFocusStyle"
    aria-label="Action button"
  >
    <component
      :is="props.iconComponent"
      class="w-6 h-6 transform transition-transform duration-150"
      :class="[props.iconClass]"
    />
  </button>
</template>

<style scoped>
button:hover > :deep(svg),
button:focus-visible > :deep(svg) {
  color: var(--icon-accent-color);
}
</style>
