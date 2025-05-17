<!-- components/leftsidebar/BottomSidebar.vue -->

<template>
  <div class="bottom-sidebar" :class="{ 'sidebar-is-collapsed': isSidebarCollapsed }">
    <ServerConnectionStatus />
  </div>
</template>

<script lang="ts" setup>
import ServerConnectionStatus from './bottomsidebar/ServerConnectionStatus.vue'
import { useSidebarState } from '../../composables/leftsidebar/topsidebar/useSidebarToggleButton'

const { isCollapsed: isSidebarCollapsed } = useSidebarState()
</script>

<script lang="ts">
export default {
  name: 'BottomSidebar',
}
</script>

<style scoped>
@import '../../assets/app/leftsidebar/bottomsidebar.css';

.bottom-sidebar {
  height: 3rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  transition: padding 0.3s ease-in-out;
}
</style>
