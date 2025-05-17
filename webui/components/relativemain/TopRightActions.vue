<!-- components/relativemain/TopRightActions.vue -->

<template>
  <div class="top-right-actions-container">
    <ThemeToggleButton />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ThemeToggleButton from './toprightactions/ThemeToggleButton.vue'

export default defineComponent({
  name: 'TopRightActions',
  components: {
    ThemeToggleButton,
  },
})
</script>

<style scoped>
@import '../../assets/app/relativemain/toprightactions.css';

/* No additional scoped styles needed if all styling is in the imported CSS */
</style>
