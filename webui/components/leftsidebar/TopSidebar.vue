<!-- components/leftsidebar/TopSidebar.vue -->

<template>
  <div class="top-sidebar" :class="{ 'sidebar-is-collapsed': isSidebarCollapsed }">
    <SidebarToggleButton />
  </div>
</template>

<script lang="ts" setup>
import SidebarToggleButton from './topsidebar/SidebarToggleButton.vue'
import { useSidebarState } from '../../composables/leftsidebar/topsidebar/useSidebarToggleButton'

const { isCollapsed: isSidebarCollapsed } = useSidebarState()
</script>

<script lang="ts">
export default {
  name: 'TopSidebar',
}
</script>

<style scoped>
@import '../../assets/app/leftsidebar/topsidebar.css';

.top-sidebar {
  height: 3rem; /* Fixed height */
  flex-shrink: 0;
  display: flex;
  align-items: center; /* Vertically centers content (the button) */
  justify-content: flex-start; /* Align content to the start, padding will position it */
  overflow: hidden;
  transition: padding 0.3s ease-in-out;
}
</style>
