<!-- components/relativemain/toprightactions/ThemeToggleButton.vue -->

<template>
  <button class="theme-toggle-button" aria-label="Toggle theme">
    <Sun :size="24" :stroke-width="2" />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Sun } from 'lucide-vue-next'

export default defineComponent({
  name: 'ThemeToggleButton',
  components: {
    Sun,
  },
  setup() {
    return {}
  },
})
</script>

<style scoped>
@import '../../../assets/app/relativemain/toprightactions/themetogglebutton.css';

.theme-toggle-button {
  width: 1.5rem;
  height: 1.5rem;
}
</style>
