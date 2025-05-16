<script setup lang="ts">
import { Package } from 'lucide-vue-next'

defineProps<{
  item: { id: string; name: string; description?: string; type?: string }
  layoutMode: 'grid' | 'list'
}>()
</script>

<template>
  <div
    class="group rounded-lg shadow transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.021] border border-[var(--sidebar-border-color)] hover:border-[var(--icon-accent-color)]"
    :style="{
      backgroundColor: 'var(--sidebar-bg)',
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
      <Package
        class="w-8 h-8 text-[var(--icon-muted-color)] transition-colors duration-170 ease-in-out group-hover:text-[var(--icon-accent-color)]"
      />
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
