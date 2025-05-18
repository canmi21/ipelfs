<!-- components/leftsidebar/topsidebar/AboutButton.vue -->

<template>
  <div class="about-button-slot">
    <a
      href="https://github.com/canmi21/ipelfs"
      target="_blank"
      rel="noopener noreferrer"
      class="about-icon-link"
      aria-label="About IPELFS"
    >
      <SquareArrowOutUpRight :size="24" :stroke-width="2" />
    </a>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { SquareArrowOutUpRight } from 'lucide-vue-next'

export default defineComponent({
  name: 'AboutButton',
  components: {
    SquareArrowOutUpRight,
  },
})
</script>

<style scoped>
@import '../../../assets/app/leftsidebar/topsidebar/aboutbutton.css';

.about-button-slot {
  width: 3rem; /* This is the 3x3rem container for the button */
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center; /* Centers the 1.5rem <a> tag */
  padding: 0;
}

/* .about-icon-link styles (for the 1.5rem <a> tag) are in the imported CSS */
</style>
