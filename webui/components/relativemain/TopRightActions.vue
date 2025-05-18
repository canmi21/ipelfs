<!-- components/relativemain/TopRightActions.vue -->

<template>
  <div class="top-right-actions-container">
    <ThemeToggleButton />
    <LanguageToggleButton />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ThemeToggleButton from './toprightactions/ThemeToggleButton.vue'
import LanguageToggleButton from './toprightactions/LanguageToggleButton.vue'

export default defineComponent({
  name: 'TopRightActions',
  components: {
    ThemeToggleButton,
    LanguageToggleButton,
  },
})
</script>

<style scoped>
@import '../../assets/app/relativemain/toprightactions.css';
/* Ensure toprightactions.css has 'gap' if multiple buttons, e.g., gap: 0.5rem; */
</style>
