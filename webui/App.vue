<!-- App.vue -->

<template>
  <div class="app-root-container">
    <div
      class="left-sidebar"
      :style="leftSidebarStyle"
      :class="{ 'sidebar-is-collapsed': isCollapsed }"
    >
      <LeftSidebar />
    </div>
    <div class="relative-main">
      <RelativeMain />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import LeftSidebar from './components/LeftSidebar.vue'
import RelativeMain from './components/RelativeMain.vue'
import { useSidebar } from './composables/leftsidebar/useSidebar'

const { isCollapsed } = useSidebar()

const leftSidebarStyle = computed(() => ({
  flexBasis: isCollapsed.value ? '3rem' : '16rem',
  transition: 'flex-basis 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
}))
</script>

<script lang="ts">
export default {
  name: 'App',
}
</script>

<style>
@import './assets/app/leftsidebar.css';
@import './assets/app/relativemain.css';

.app-root-container {
  display: flex;
  height: 100vh; /* Fallback for older browsers */
  height: 100svh; /* Use Small Viewport Height for mobile to avoid overlap with browser UI */
}

.left-sidebar {
  overflow-x: hidden;
}

.relative-main {
  flex: 1;
  overflow-y: auto;
  transition: margin-left 0.3s ease-in-out;
}
</style>
