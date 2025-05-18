<!-- components/leftsidebar/TopSidebar.vue -->

<template>
  <div class="top-sidebar" :class="{ 'sidebar-is-collapsed': isSidebarCollapsed }">
    <SidebarToggleButton />
    <div class="about-button-wrapper" v-show="!isSidebarCollapsed">
      <transition name="fade-about-button">
        <AboutButton v-show="!isSidebarCollapsed" />
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SidebarToggleButton from './topsidebar/SidebarToggleButton.vue'
import AboutButton from './topsidebar/AboutButton.vue'
import { useSidebar } from '../../composables/leftsidebar/useSidebar'

const { isCollapsed: isSidebarCollapsed } = useSidebar()

// No dynamic :style needed for height or justify-content here, handled by CSS
</script>

<script lang="ts">
export default {
  name: 'TopSidebar',
}
</script>

<style scoped>
@import '../../assets/app/leftsidebar/topsidebar.css';

/* .top-sidebar's base styles (height, display, align-items, overflow)
   are now primarily in the imported topsidebar.css.
   justify-content is also handled there or by flexbox defaults with the new wrapper.
*/

.about-button-wrapper {
  margin-left: auto; /* This pushes this wrapper (and AboutButton inside) to the right */
  display: flex; /* Ensures the wrapper itself behaves as a flex item if needed */
  align-items: center; /* Vertically align the AboutButton's slot if necessary */
}

/* Styles for the AboutButton fade transition */
.fade-about-button-enter-active {
  transition: opacity 0.15s ease-in-out 0.1s; /* Fade-in: 0.15s duration, 0.1s DELAY */
}
.fade-about-button-leave-active {
  transition: opacity 0.25s ease-in-out; /* Fade-out: 0.25s duration, NO DELAY */
}

.fade-about-button-enter-from,
.fade-about-button-leave-to {
  opacity: 0;
}

.fade-about-button-enter-to,
.fade-about-button-leave-from {
  opacity: 1;
}
</style>
