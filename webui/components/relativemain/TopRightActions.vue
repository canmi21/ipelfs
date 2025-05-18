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
/* No additional scoped styles needed here as layout is in the imported CSS */
</style>
