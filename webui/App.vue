<template>
  <div class="flex h-screen">
    <div class="left-sidebar"><LeftSidebar /></div>
    <div class="relative-main"><RelativeMain /></div>
  </div>
</template>

<script lang="ts">
import LeftSidebar from './components/LeftSidebar.vue'
import RelativeMain from './components/RelativeMain.vue'

export default {
  name: 'App',
  components: {
    LeftSidebar,
    RelativeMain,
  },
  mounted() {
    // Dark mode setup based on system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark')
    }
  },
}
</script>

<style>
/* Import global styles for sidebar and main content area aesthetics */
@import './assets/app/leftsidebar.css';
@import './assets/app/relativemain.css';

/*
  Tailwind classes like 'flex' and 'h-screen' are used in the template.
  If Tailwind CSS is configured correctly, defining them here is redundant.
*/

.left-sidebar {
  flex: 0 0 16rem; /* Sidebar has a fixed width of 16rem and won't grow or shrink. Height will stretch to fill parent. */
  /* Background, padding, and color will come from the imported 'leftsidebar.css' */
}

.relative-main {
  flex: 1; /* Main content area takes up the remaining space. */
  overflow-y: auto; /* Allows only the main content area to scroll if its content overflows. */
}
</style>
