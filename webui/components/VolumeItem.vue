<script setup lang="ts">
import { Package } from 'lucide-vue-next'

defineProps<{
  item: { id: number; name: string; description?: string; type?: string }
  layoutMode: 'grid' | 'list'
}>()
</script>

<template>
  <div
    class="rounded-lg shadow transition-all duration-200 ease-in-out hover:shadow-xl"
    :style="{
      backgroundColor: 'var(--sidebar-bg)',
      border: `1px solid var(--sidebar-border-color)`,
    }"
    :class="{
      'p-4 flex flex-col items-start text-left': layoutMode === 'grid',
      'p-3 flex items-center space-x-4': layoutMode === 'list',
    }"
  >
    <div
      class="flex-shrink-0 rounded-md flex items-center justify-center"
      :class="{
        'w-12 h-12 mb-2': layoutMode === 'grid',
        'w-12 h-12': layoutMode === 'list',
      }"
    >
      <Package class="text-slate-500 dark:text-slate-400 w-8 h-8" />
    </div>

    <div class="flex-grow min-w-0" :class="{ 'w-full': layoutMode === 'grid' }">
      <h3
        class="font-semibold truncate"
        :class="{
          'text-md mb-1': layoutMode === 'grid',
          'text-md': layoutMode === 'list',
        }"
        :style="{ color: 'var(--text-main-color)' }"
        :title="item.name"
      >
        {{ item.name }}
      </h3>
      <p
        v-if="item.description"
        class="text-xs truncate"
        :style="{ color: 'var(--sidebar-text-muted)' }"
        :title="item.description"
        :class="{ '': layoutMode === 'grid' }"
      >
        {{ item.description }}
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Styles specific to VolumeItem if needed beyond Tailwind classes */
</style>
