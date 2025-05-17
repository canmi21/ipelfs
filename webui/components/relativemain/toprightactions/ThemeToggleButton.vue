<!-- components/relativemain/toprightactions/ThemeToggleButton.vue -->

<template>
  <button class="theme-toggle-button" @click="cycleTheme" aria-label="Toggle theme">
    <component :is="iconToDisplay" :size="24" :stroke-width="2" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
// Icons (Sun, Moon, SunMoon) will be dynamically provided by the composable
import { useThemeToggleButton } from '../../../composables/relativemain/toprightactions/useThemeToggleButton'

export default defineComponent({
  name: 'ThemeToggleButton',
  setup() {
    const { cycleTheme, currentIconComponent } = useThemeToggleButton()

    return {
      cycleTheme,
      iconToDisplay: currentIconComponent,
    }
  },
})
</script>

<style scoped>
@import '../../../assets/app/relativemain/toprightactions/themetogglebutton.css';

.theme-toggle-button {
  width: 1.5rem;
  height: 1.5rem;
  /* Display flex, align-items, justify-content are in the imported CSS */
}
</style>
