<script setup lang="ts">
import {
  useGlobalSwitches,
  type SwitchConfig,
  type SwitchStateConfig,
} from './../composables/useGlobalSwitches'
import ActionSwitch from './ActionSwitch.vue'

const { switches } = useGlobalSwitches()
const getCurrentStateConfig = (swConfig: Readonly<SwitchConfig>): Readonly<SwitchStateConfig> => {
  const foundState = swConfig.states.find((s) => s.value === swConfig.currentStateValue)
  return foundState || swConfig.states[0]
}
</script>

<template>
  <div
    v-if="switches.length > 0"
    class="absolute top-4 right-4 z-40"
    aria-label="Global page actions"
  >
    <TransitionGroup
      name="switch-list"
      tag="div"
      class="flex items-center flex-row-reverse gap-x-1"
    >
      <ActionSwitch
        v-for="sw in switches"
        :key="sw.id"
        :icon-component="getCurrentStateConfig(sw).iconComponent"
        :icon-class="getCurrentStateConfig(sw).iconClass"
        :title="getCurrentStateConfig(sw).title"
        :on-toggle="sw.onToggle"
      />
    </TransitionGroup>
  </div>
</template>
