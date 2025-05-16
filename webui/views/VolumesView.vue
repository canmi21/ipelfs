<script setup lang="ts">
import { ref, computed } from 'vue'
import LayoutSwitcher from './../components/LayoutSwitcher.vue'
import VolumeItem from './../components/VolumeItem.vue'

type LayoutMode = 'grid' | 'list'

const layoutMode = ref<LayoutMode>('grid') // Default to grid view

// Dummy data for 8 items
const volumes = ref(
  Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Storage Volume ${i + 1}`,
    description: `This is a sample description for volume number ${i + 1}. It might contain some details.`,
    type: i % 2 === 0 ? 'SSD' : 'HDD Archive',
  })),
)

const handleLayoutUpdate = (newLayout: LayoutMode) => {
  layoutMode.value = newLayout
}

// Dynamic classes for the list container
const listContainerClasses = computed(() => {
  if (layoutMode.value === 'grid') {
    return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'
  } else {
    return 'flex flex-col space-y-4'
  }
})
</script>

<template>
  <div class="p-4 md:p-6">
    <div class="flex flex-col sm:flex-row justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl md:text-3xl font-semibold" :style="{ color: 'var(--text-main-color)' }">
          Volumes
        </h1>
        <p class="mt-1 text-sm md:text-base" :style="{ color: 'var(--sidebar-text-muted)' }">
          Manage your storage volumes here.
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <LayoutSwitcher :current-layout="layoutMode" @update:layout="handleLayoutUpdate" />
      </div>
    </div>

    <div :class="listContainerClasses">
      <VolumeItem
        v-for="volume in volumes"
        :key="volume.id"
        :item="volume"
        :layout-mode="layoutMode"
      />
    </div>
  </div>
</template>

<style scoped>
/* Add any specific styles for VolumesView if needed */
</style>
