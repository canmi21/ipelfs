<!-- components/leftsidebar/TopSidebar.vue -->

<template>
  <div
    class="top-sidebar"
    :style="topSidebarContainerStyle"
    :class="{ 'sidebar-is-collapsed': isSidebarCollapsed }"
  >
    <SidebarToggleButton />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import SidebarToggleButton from './topsidebar/SidebarToggleButton.vue'
import { useSidebarState } from '../../composables/leftsidebar/topsidebar/useSidebarToggleButton'

const { isCollapsed: isSidebarCollapsed } = useSidebarState()

const topSidebarContainerStyle = computed(() => ({
  height: '3rem', // Fixed height of 3rem for both states
  justifyContent: 'center', // Always center the button
}))
</script>

<script lang="ts">
export default {
  name: 'TopSidebar',
}
</script>

<style scoped>
@import '../../assets/app/leftsidebar/topsidebar.css';

.top-sidebar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  overflow: hidden;
  transition:
    height 0.3s ease-in-out,
    /* Height transition might be less relevant if always 3rem */ padding 0.3s ease-in-out;
}
</style>
