import { ref, readonly, computed, type Component as VueComponent } from 'vue'

export interface SwitchStateConfig {
  value: string
  iconComponent: VueComponent | string
  iconClass?: string
  title?: string
}

export interface SwitchConfig {
  id: string
  states: ReadonlyArray<SwitchStateConfig>
  currentStateValue: string
  onToggle: () => void
  displayCondition?: () => boolean
  order?: number
}

const globalSwitches = ref<SwitchConfig[]>([]) // ref: states -> ReadonlyArray

export function useGlobalSwitches() {
  const registerSwitch = (config: SwitchConfig) => {
    const index = globalSwitches.value.findIndex((s) => s.id === config.id)
    if (index === -1) {
      globalSwitches.value.push(config)
    } else {
      globalSwitches.value[index] = { ...globalSwitches.value[index], ...config }
    }
    globalSwitches.value.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
  }

  const unregisterSwitch = (id: string) => {
    globalSwitches.value = globalSwitches.value.filter((s) => s.id !== id)
  }

  const updateSwitchState = (id: string, newStateValue: string) => {
    const sw = globalSwitches.value.find((s) => s.id === id)
    if (sw) {
      sw.currentStateValue = newStateValue
      const index = globalSwitches.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        globalSwitches.value.splice(index, 1, { ...sw })
      }
    }
  }

  const visibleSwitches = computed(() => {
    return globalSwitches.value.filter((sw) => !sw.displayCondition || sw.displayCondition())
  })

  return {
    switches: readonly(visibleSwitches),
    registerSwitch,
    unregisterSwitch,
    updateSwitchState,
  }
}
