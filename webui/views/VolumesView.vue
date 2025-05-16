<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import VolumeItem from './../components/VolumeItem.vue'
import { useGlobalSwitches, type SwitchConfig } from './../composables/useGlobalSwitches'
import { useRoute } from 'vue-router'
import { LayoutGrid, LayoutList } from 'lucide-vue-next'

type LayoutMode = 'grid' | 'list'
const layoutMode = ref<LayoutMode>('grid')

const volumes = ref(
  Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Storage Volume ${i + 1}`,
    description: `This is a sample description for volume no. ${i + 1}.`,
    type: i % 2 === 0 ? 'SSD' : 'HDD Archive',
  })),
)

const { registerSwitch, unregisterSwitch } = useGlobalSwitches()
const route = useRoute()
const LAYOUT_SWITCH_ID = 'volumes-layout-switch'

const isVolumesPageActive = computed(() => {
  return route.path === '/volumes'
})

const layoutSwitchConfig = computed(
  (): SwitchConfig => ({
    id: LAYOUT_SWITCH_ID,
    order: 10,
    states: [
      {
        value: 'grid',
        iconComponent: LayoutGrid,
        title: 'Grid View',
      },
      {
        value: 'list',
        iconComponent: LayoutList,
        title: 'List View',
      },
    ],
    currentStateValue: layoutMode.value,
    onToggle: () => {
      layoutMode.value = layoutMode.value === 'grid' ? 'list' : 'grid'
    },
    displayCondition: () => isVolumesPageActive.value,
  }),
)

watch(
  [layoutSwitchConfig, isVolumesPageActive],
  ([newConfig, onPage], [oldOnPage]) => {
    if (onPage) {
      registerSwitch(newConfig)
    } else if (oldOnPage && !onPage) {
      unregisterSwitch(LAYOUT_SWITCH_ID)
    }
  },
  { immediate: true, deep: true },
)

onUnmounted(() => {
  if (isVolumesPageActive.value) {
    unregisterSwitch(LAYOUT_SWITCH_ID)
  }
})

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
      <div class="mt-4 sm:mt-0"></div>
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
