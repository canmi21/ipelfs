<script setup lang="ts">
import { computed } from 'vue'
import { Info } from 'lucide-vue-next'
import CardActionIcon from './CardActionIcon.vue' // <--- 修改导入

const props = defineProps<{
  layoutMode: 'grid' | 'list'
  itemName: string
  itemId: string
}>()

const emit = defineEmits(['actionActivityChange'])

const handleInfoToggle = () => {
  // 实际的 Info 操作逻辑
}

const infoSwitchState = computed(() => ({
  iconComponent: Info,
  title: `More info about ${props.itemName}`,
  iconClass: props.layoutMode === 'grid' ? 'w-4 h-4' : 'w-5 h-5', // 这个尺寸会传递给 CardActionIcon
}))
</script>

<template>
  <div
    :class="{
      'absolute top-1 right-1 z-20': props.layoutMode === 'grid',
      'ml-auto pl-2 flex-shrink-0': props.layoutMode === 'list',
    }"
    @mouseenter="emit('actionActivityChange', true)"
    @mouseleave="emit('actionActivityChange', false)"
    @focusin="emit('actionActivityChange', true)"
    @focusout="emit('actionActivityChange', false)"
  >
    <CardActionIcon
      :icon-component="infoSwitchState.iconComponent"
      :title="infoSwitchState.title"
      :on-toggle="handleInfoToggle"
      :icon-class="infoSwitchState.iconClass"
    />
  </div>
</template>
