<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Package } from 'lucide-vue-next'
import VolumeItemActions from './VolumeItemActions.vue'
import VolumeItemProgressBar from './VolumeItemProgressBar.vue'

const props = defineProps<{
  item: { id: string; name: string; description?: string; type?: string }
  layoutMode: 'grid' | 'list'
}>()

const isCardHovered = ref(false)
const isAnActionActive = ref(false)

const usagePercentage = ref(0)
onMounted(() => {
  usagePercentage.value = Math.floor(Math.random() * 101)
})

const handleActionActivityChange = (isActive: boolean) => {
  isAnActionActive.value = isActive
}

const packageIconClasses = computed(() => {
  let colorClass = 'text-[var(--icon-muted-color)]'
  if (isCardHovered.value && !isAnActionActive.value) {
    colorClass = 'text-[var(--icon-accent-color)]'
  }
  return ['w-8 h-8', colorClass, 'transition-colors duration-150 ease-in-out']
})
</script>

<template>
  <div
    class="group rounded-lg shadow transition-shadow duration-300 ease-in-out hover:shadow-xl border border-[var(--sidebar-border-color)] hover:border-[var(--icon-accent-color)] relative"
    :style="{
      backgroundColor: 'var(--sidebar-bg)',
    }"
    :class="{
      'p-4 flex flex-col items-start text-left': layoutMode === 'grid',
      'p-3 flex items-center space-x-4': layoutMode === 'list',
    }"
    @mouseenter="isCardHovered = true"
    @mouseleave="isCardHovered = false"
  >
    <VolumeItemActions
      :layout-mode="props.layoutMode"
      :item-name="props.item.name"
      :item-id="props.item.id"
      @action-activity-change="handleActionActivityChange"
    />

    <div
      class="flex-shrink-0 rounded-md flex items-center justify-center"
      :class="{
        'w-12 h-12 mb-2': layoutMode === 'grid',
        'w-12 h-12': layoutMode === 'list',
      }"
    >
      <Package :class="packageIconClasses" />
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
    </div>

    <VolumeItemProgressBar :usage-percentage="usagePercentage" />
  </div>
</template>
