<!-- components/leftsidebar/TopSidebar.vue -->

<template>
  <div class="top-sidebar">
    <div class="logo" v-show="!isSidebarCollapsed">
      <h2>My App</h2>
    </div>
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
  height: 4rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
}
.logo {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
