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
</script>

<script lang="ts">
export default {
  name: 'TopSidebar',
}
</script>

<style scoped>
@import '../../assets/app/leftsidebar/topsidebar.css';

/* .top-sidebar base styles are now fully in the imported topsidebar.css */
/* Any justify-content that was here should be removed to defer to the external CSS logic,
   or ensure it's 'flex-start' or not set, to allow margin-left: auto to work.
   The current external CSS has no justify-content for the base .top-sidebar rule,
   which defaults to flex-start, which is correct.
*/

.about-button-wrapper {
  margin-left: auto; /* This pushes this wrapper (and AboutButton inside) to the right */
  display: flex;
  align-items: center;
}

/* Styles for the AboutButton fade transition */
.fade-about-button-enter-active {
  transition: opacity 0.15s ease-in-out 0.1s;
}
.fade-about-button-leave-active {
  transition: opacity 0.25s ease-in-out;
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
