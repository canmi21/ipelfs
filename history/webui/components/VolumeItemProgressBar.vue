<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  usagePercentage: number
}>()

const progressBarTrackClass = computed(() => 'bg-slate-200 dark:bg-slate-700')

const progressBarFillClass = computed(() => {
  if (props.usagePercentage <= 70) return 'bg-[#1c9376]'
  if (props.usagePercentage <= 90) return 'bg-yellow-500'
  return 'bg-[#ef4444]'
})
</script>

<template>
  <div class="w-full h-1.5 rounded-full mt-1" :class="progressBarTrackClass">
    <div
      class="h-1.5 rounded-full transition-all duration-300 ease-in-out"
      :class="progressBarFillClass"
      :style="{ width: usagePercentage + '%' }"
    ></div>
  </div>
</template>
