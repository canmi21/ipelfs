<!-- components/relativemain/toprightactions/ThemeToggleButton.vue -->

<template>
  <button
    class="theme-toggle-button"
    :class="buttonDynamicClass"
    @click="cycleTheme"
    aria-label="Toggle theme"
  >
    <component :is="iconToDisplay" :size="24" :stroke-width="2" />
  </button>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
// Lucide icons (Sun, Moon, SunMoon) are now managed and returned by the composable
import { useThemeToggleButton } from '../../../composables/relativemain/toprightactions/useThemeToggleButton'

export default defineComponent({
  name: 'ThemeToggleButton',
  // components: { Sun, Moon, SunMoon }, // No longer needed to register icons here explicitly
  setup() {
    const { cycleTheme, currentIconComponent, preferredThemeMode } = useThemeToggleButton()

    // This computed property generates the dynamic class for CSS based on the preferred theme
    const buttonDynamicClass = computed(() => {
      return `theme-mode-${preferredThemeMode.value}`
    })

    return {
      cycleTheme,
      iconToDisplay: currentIconComponent, // This will be Sun, Moon, or SunMoon based on initial state
      buttonDynamicClass,
      // preferredThemeMode can be returned if needed for other template logic, but buttonDynamicClass uses it
    }
  },
})
</script>

<style scoped>
@import '../../../assets/app/relativemain/toprightactions/themetogglebutton.css';

.theme-toggle-button {
  width: 1.5rem;
  height: 1.5rem;
  /* Display flex, align-items, justify-content are in the imported CSS
     to ensure the icon passed via <component :is="iconToDisplay" /> is centered. */
}
</style>
