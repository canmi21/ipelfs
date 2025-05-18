<!-- components/leftsidebar/TopSidebar.vue -->

<template>
  <div class="top-sidebar" :class="{ 'sidebar-is-collapsed': isSidebarCollapsed }">
    <SidebarToggleButton />
    <transition name="fade-about-button">
      <AboutButton v-show="!isSidebarCollapsed" />
    </transition>
  </div>
</template>

<script lang="ts" setup>
import SidebarToggleButton from './topsidebar/SidebarToggleButton.vue'
import AboutButton from './topsidebar/AboutButton.vue'
import { useSidebar } from '../../composables/leftsidebar/useSidebar'

const { isCollapsed: isSidebarCollapsed } = useSidebar()
</script>

<script lang="ts">
export default {
  name: 'TopSidebar',
}
</script>

<style scoped>
@import '../../assets/app/leftsidebar/topsidebar.css';

/* .top-sidebar base styles (height, flex, etc.) are now primarily in the imported CSS. */
/* Scoped styles are for component-specific overrides or truly unique aspects. */

/* Styles for the AboutButton fade transition */
.fade-about-button-enter-active,
.fade-about-button-leave-active {
  transition: opacity 0.15s ease-in-out;
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
