<script setup lang="ts">
import type { Component as VueComponent } from 'vue'

const props = defineProps<{
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
    class="p-1.5 rounded-md group transition-colors duration-150 ease-in-out focusable-ui-element"
    :style="{
      color: 'var(--icon-muted-color)',
    }"
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
button:hover > :deep(svg),
button:focus-visible > :deep(svg) {
  /* Icon color changes on hover AND keyboard focus */
  color: var(--icon-accent-color);
}
</style>
