<!-- components/relativemain/toprightactions/LanguageToggleButton.vue -->

<template>
  <div class="action-button-slot">
    <button class="language-toggle-button" @click="toggleLanguage" aria-label="Toggle language">
      <Languages :size="24" :stroke-width="2" />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Languages } from 'lucide-vue-next'
import { useLanguageToggle } from '../../../composables/relativemain/toprightactions/useLanguageToggle'

export default defineComponent({
  name: 'LanguageToggleButton',
  components: {
    Languages,
  },
  setup() {
    const { toggleLanguage } = useLanguageToggle()

    return {
      toggleLanguage,
    }
  },
})
</script>

<style scoped>
@import '../../../assets/app/relativemain/toprightactions/languagetogglebutton.css';

.action-button-slot {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0; /* Slot itself has no padding */
}

.language-toggle-button {
  /* This is the inner 1.5rem x 1.5rem button */
  width: 1.5rem;
  height: 1.5rem;
  /* Flex properties for centering icon within this button are in the imported CSS */
}
</style>
