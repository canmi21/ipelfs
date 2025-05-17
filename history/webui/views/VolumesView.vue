<script setup lang="ts">
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import VolumeItem from './../components/VolumeItem.vue'
import { useGlobalSwitches, type SwitchConfig } from './../composables/useGlobalSwitches'
import { useRoute } from 'vue-router'
import { LayoutGrid, LayoutList } from 'lucide-vue-next'
import { useVolumes } from './../composables/useVolumes'

type LayoutMode = 'grid' | 'list'
const layoutMode = ref<LayoutMode>('grid')

const { volumesList, isLoading: isLoadingVolumes, error: volumesError, fetchVolumes } = useVolumes()

const itemsToDisplay = computed(() => {
  return volumesList.value.map((vol, index) => ({
    id: vol.id,
    name: vol.path.split('/').pop() || `Volume ${index + 1}`,
    description: `${vol.path}`, // Use path as description
  }))
})

onMounted(() => {
  fetchVolumes()
})

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
      { value: 'grid', iconComponent: LayoutGrid, title: 'Grid View' },
      { value: 'list', iconComponent: LayoutList, title: 'List View' },
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
  ([newConfig, onPage], [oldConfig, oldOnPage]) => {
    if (onPage) {
      registerSwitch(newConfig)
    } else if (oldConfig && oldOnPage && !onPage) {
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
    return 'flex flex-col gap-4'
  }
})
</script>

<template>
  <div class="p-4 md:p-6">
    <div class="flex flex-col sm:flex-row justify-between items-center mb-6">
      <div>
        <h1 class="text-xl md:text-1xl font-semibold" :style="{ color: 'var(--text-main-color)' }">
          Volumes
          <span v-if="!isLoadingVolumes && itemsToDisplay.length > 0"
            >({{ itemsToDisplay.length }})</span
          >
        </h1>
        <p
          v-if="isLoadingVolumes"
          class="mt-1 text-sm"
          :style="{ color: 'var(--sidebar-text-muted)' }"
        >
          Loading volumes data...
        </p>
        <p v-if="volumesError" class="mt-1 text-sm text-red-500 dark:text-red-400">
          Error loading volumes: {{ volumesError }}
        </p>
      </div>
      <div class="mt-4 sm:mt-0"></div>
    </div>

    <Transition name="layout-fade" mode="out-in">
      <div :key="layoutMode" :class="listContainerClasses">
        <div
          v-if="isLoadingVolumes"
          class="col-span-full text-center py-10"
          :style="{ color: 'var(--sidebar-text-muted)' }"
        >
          Loading...
        </div>
        <div
          v-else-if="volumesError"
          class="col-span-full text-center py-10 text-red-500 dark:text-red-400"
        >
          Failed to load volumes. Please try again later.
        </div>
        <div
          v-else-if="itemsToDisplay.length === 0"
          class="col-span-full text-center py-10"
          :style="{ color: 'var(--sidebar-text-muted)' }"
        >
          No volumes found.
        </div>
        <VolumeItem
          v-else
          v-for="volume in itemsToDisplay"
          :key="volume.id"
          :item="volume"
          :layout-mode="layoutMode"
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.layout-fade-enter-active,
.layout-fade-leave-active {
  transition: opacity 0.15s ease-in-out;
}
.layout-fade-enter-from,
.layout-fade-leave-to {
  opacity: 0;
}
</style>
