<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Package, Info } from 'lucide-vue-next'
import ActionSwitch from './ActionSwitch.vue'

const props = defineProps<{
  item: { id: string; name: string; description?: string; type?: string }
  layoutMode: 'grid' | 'list'
}>()

const usagePercentage = ref(0)

onMounted(() => {
  usagePercentage.value = Math.floor(Math.random() * 101) // 0 to 100
})

const handleInfoToggle = () => {
  // Placeholder action for the info button
  console.log('Info icon clicked for item:', props.item.id)
  // Here you would typically open a modal or show more details
}

const progressBarTrackClass = computed(() => {
  return 'bg-slate-200 dark:bg-slate-700'
})

const progressBarFillClass = computed(() => {
  if (usagePercentage.value <= 70) {
    return 'bg-[#1c9376]' // Green (like success/info notification primary)
  } else if (usagePercentage.value <= 90) {
    return 'bg-yellow-500' // Yellow (like warning notification primary)
  } else {
    return 'bg-[#ef4444]' // Red (like error notification primary)
  }
})

const infoSwitchState = computed(() => ({
  iconComponent: Info,
  title: `More info about ${props.item.name}`,
  // iconClass: 'w-5 h-5' // ActionSwitch icon is w-6 h-6 by default. Adjust if needed for corner.
}))
</script>

<template>
  <div
    class="group rounded-lg shadow transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.021] border border-[var(--sidebar-border-color)] hover:border-[var(--icon-accent-color)] relative"
    :style="{
      backgroundColor: 'var(--sidebar-bg)',
    }"
    :class="{
      'p-4 flex flex-col items-start text-left': layoutMode === 'grid',
      'p-3 flex items-center space-x-4': layoutMode === 'list',
    }"
  >
    <div class="absolute top-1 right-1 z-10" v-if="layoutMode === 'grid'">
      <ActionSwitch
        :icon-component="infoSwitchState.iconComponent"
        :title="infoSwitchState.title"
        :on-toggle="handleInfoToggle"
        :icon-class="'w-4 h-4'"
      />
    </div>

    <div
      class="flex-shrink-0 rounded-md flex items-center justify-center"
      :class="{
        'w-12 h-12 mb-2': layoutMode === 'grid',
        'w-12 h-12': layoutMode === 'list',
      }"
    >
      <Package
        class="w-8 h-8 text-[var(--icon-muted-color)] transition-colors duration-150 ease-in-out group-hover:text-[var(--icon-accent-color)]"
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
        :class="{ 'mb-2': layoutMode === 'grid' }"
      >
        {{ item.description }}
      </p>

      <div class="w-full h-1.5 rounded-full mt-1" :class="[progressBarTrackClass]">
        <div
          class="h-1.5 rounded-full transition-all duration-300 ease-in-out"
          :class="[progressBarFillClass]"
          :style="{ width: usagePercentage + '%' }"
        ></div>
      </div>
    </div>

    <div class="ml-auto pl-2" v-if="layoutMode === 'list'">
      <ActionSwitch
        :icon-component="infoSwitchState.iconComponent"
        :title="infoSwitchState.title"
        :on-toggle="handleInfoToggle"
        :icon-class="'w-5 h-5'"
      />
    </div>
  </div>
</template>
