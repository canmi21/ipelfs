<script setup lang="ts">
import { LayoutGrid, LayoutList } from 'lucide-vue-next'

const props = defineProps<{
  currentLayout: 'grid' | 'list'
}>()

const emit = defineEmits(['update:layout']) // Vue 3 style emit declaration

const setLayout = (layout: 'grid' | 'list') => {
  emit('update:layout', layout)
}
</script>

<template>
  <div class="flex items-center space-x-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
    <button
      @click="setLayout('grid')"
      :class="[
        'p-1.5 rounded-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
        props.currentLayout === 'grid'
          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200',
      ]"
      title="Grid View"
      aria-label="Switch to grid view"
    >
      <LayoutGrid class="w-5 h-5" />
    </button>
    <button
      @click="setLayout('list')"
      :class="[
        'p-1.5 rounded-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
        props.currentLayout === 'list'
          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200',
      ]"
      title="List View"
      aria-label="Switch to list view"
    >
      <LayoutList class="w-5 h-5" />
    </button>
  </div>
</template>
