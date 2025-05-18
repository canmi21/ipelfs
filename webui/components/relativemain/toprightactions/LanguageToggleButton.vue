<!-- components/relativemain/toprightactions/LanguageToggleButton.vue -->

<template>
  <button class="language-toggle-button" @click="toggleLanguage" aria-label="Toggle language">
    <Languages :size="24" :stroke-width="2" />
  </button>
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

.language-toggle-button {
  width: 1.5rem;
  height: 1.5rem;
}
</style>
