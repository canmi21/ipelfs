<script setup lang="ts">
defineProps<{
  item: { id: number; name: string; description?: string; type?: string }
  layoutMode: 'grid' | 'list'
}>()
</script>

<template>
  <div
    class="rounded-lg shadow transition-all duration-200 ease-in-out hover:shadow-xl"
    :style="{
      backgroundColor: 'var(--sidebar-bg)' /* Using sidebar-bg for card background */,
      border: `1px solid var(--sidebar-border-color)`,
    }"
    :class="{
      'p-4 flex flex-col': layoutMode === 'grid', // Grid item specific layout
      'p-3 flex items-center space-x-4': layoutMode === 'list', // List item specific layout
    }"
  >
    <div
      class="flex-shrink-0 rounded-md flex items-center justify-center"
      :class="{
        'w-16 h-16 bg-slate-200 dark:bg-slate-700 mb-3': layoutMode === 'grid',
        'w-12 h-12 bg-slate-200 dark:bg-slate-700': layoutMode === 'list',
      }"
    >
      <Cube
        class="text-slate-500 dark:text-slate-400"
        :class="{
          'w-8 h-8': layoutMode === 'grid',
          'w-6 h-6': layoutMode === 'list',
        }"
      />
    </div>
    <div class="flex-grow min-w-0">
      <h3
        class="font-semibold truncate"
        :class="{
          'text-lg mb-1 text-center': layoutMode === 'grid',
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
        :class="{ 'text-center': layoutMode === 'grid' }"
        :title="item.description"
      >
        {{ item.description }}
      </p>
      <p
        v-if="item.type && layoutMode === 'grid'"
        class="text-xs mt-2 text-center rounded-full px-2 py-0.5 inline-block"
        :style="{
          backgroundColor: 'var(--sidebar-item-hover-bg)',
          color: 'var(--icon-accent-color)',
        }"
      >
        {{ item.type }}
      </p>
      <p
        v-if="item.type && layoutMode === 'list'"
        class="text-xs mt-0.5"
        :style="{ color: 'var(--icon-accent-color)' }"
      >
        Type: {{ item.type }}
      </p>
    </div>
    <div v-if="layoutMode === 'grid'" class="mt-3 text-center">
      <button
        class="text-xs px-3 py-1 rounded-md text-white manage-button"
        :style="{ backgroundColor: 'var(--button-primary-bg)' }"
      >
        Manage
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Ensure text truncation works well, especially in grid mode if height is constrained */
</style>
