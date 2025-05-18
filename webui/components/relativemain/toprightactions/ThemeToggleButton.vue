<!-- components/relativemain/toprightactions/ThemeToggleButton.vue -->

<template>
  <div class="action-button-slot">
    <button
      class="theme-toggle-button"
      :class="buttonDynamicClass"
      @click="cycleTheme"
      aria-label="Toggle theme"
    >
      <component :is="iconToDisplay" :size="24" :stroke-width="2" />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useThemeToggleButton } from '../../../composables/relativemain/toprightactions/useThemeToggleButton'

export default defineComponent({
  name: 'ThemeToggleButton',
  setup() {
    const { cycleTheme, currentIconComponent, preferredThemeMode } = useThemeToggleButton()

    const buttonDynamicClass = computed(() => {
      return `theme-mode-${preferredThemeMode.value}`
    })

    return {
      cycleTheme,
      iconToDisplay: currentIconComponent,
      buttonDynamicClass,
    }
  },
})
</script>

<style scoped>
@import '../../../assets/app/relativemain/toprightactions/themetogglebutton.css';

.action-button-slot {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0; /* Slot itself has no padding */
}

.theme-toggle-button {
  /* This is the inner 1.5rem x 1.5rem button */
  width: 1.5rem;
  height: 1.5rem;
  /* Flex properties for centering icon within this button are in the imported CSS */
}
</style>
