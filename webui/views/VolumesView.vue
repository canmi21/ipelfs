<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
// import LayoutSwitcher from './../components/LayoutSwitcher.vue'; // REMOVE THIS IMPORT
import VolumeItem from './../components/VolumeItem.vue'
import { useGlobalSwitches, type SwitchConfig } from './../composables/useGlobalSwitches' // Adjust path
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

// --- Layout Switch Registration ---
const { registerSwitch, unregisterSwitch } = useGlobalSwitches()
const route = useRoute()
const LAYOUT_SWITCH_ID = 'volumes-layout-switch'

// Condition to show this switch only on the /volumes page
const isVolumesPageActive = computed(() => {
  // Adjust this condition based on your router setup if /volumes can have sub-routes
  // For exact match:
  return route.path === '/volumes'
  // Or by name:
  // return route.name === 'Volumes';
})

const layoutSwitchConfig = computed(
  (): SwitchConfig => ({
    id: LAYOUT_SWITCH_ID,
    order: 10, // Higher number means further to the left (or lower priority if sorted ascendingly for rightmost)
    // Given flex-row-reverse, higher order = further left. Lower order = further right.
    // Theme switch has order: 0 (rightmost), so this should be > 0.
    states: [
      {
        value: 'grid',
        iconComponent: LayoutGrid,
        title: 'Grid View',
        iconClass: layoutMode.value === 'grid' ? 'text-[var(--icon-accent-color)]' : '',
      },
      {
        value: 'list',
        iconComponent: LayoutList,
        title: 'List View',
        iconClass: layoutMode.value === 'list' ? 'text-[var(--icon-accent-color)]' : '',
      },
    ],
    currentStateValue: layoutMode.value,
    onToggle: () => {
      layoutMode.value = layoutMode.value === 'grid' ? 'list' : 'grid'
      // When toggling, we need to re-register the switch for its currentStateValue and iconClass to update
      // This happens because layoutSwitchConfig is a computed and will re-evaluate.
      // The watch below will handle re-registration.
    },
    displayCondition: () => isVolumesPageActive.value,
  }),
)

// Watch for changes that require re-registering or unregistering the switch
watch(
  [layoutSwitchConfig, isVolumesPageActive], // Watch both the config and the display condition
  ([newConfig, onPage], [oldOnPage]) => {
    if (onPage) {
      registerSwitch(newConfig)
    } else if (oldOnPage && !onPage) {
      // If we navigated away from the page
      unregisterSwitch(LAYOUT_SWITCH_ID)
    }
  },
  { immediate: true, deep: true }, // immediate for initial registration, deep for config changes
)

onUnmounted(() => {
  // Ensure switch is unregistered if the component is unmounted
  // (e.g., navigating to a completely different part of app not using this view anymore)
  if (isVolumesPageActive.value) {
    // Only unregister if it was active for this page
    unregisterSwitch(LAYOUT_SWITCH_ID)
  }
})

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
