<!-- components/leftsidebar/TopSidebar.vue -->

<template>
  <div
    class="top-sidebar"
    :style="topSidebarContainerStyle"
    :class="{ 'sidebar-is-collapsed': isSidebarCollapsed }"
  >
    <div class="logo" v-show="!isSidebarCollapsed">
      <h2>My App</h2>
    </div>
    <SidebarToggleButton />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import SidebarToggleButton from './topsidebar/SidebarToggleButton.vue'
import { useSidebarState } from '../../composables/leftsidebar/topsidebar/useSidebarToggleButton'

const { isCollapsed: isSidebarCollapsed } = useSidebarState()

const topSidebarContainerStyle = computed(() => ({
  height: isSidebarCollapsed.value ? '3rem' : '4rem', // 折叠时高度为 3rem
  justifyContent: isSidebarCollapsed.value ? 'center' : 'space-between',
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
    padding 0.3s ease-in-out;
}
.logo {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
