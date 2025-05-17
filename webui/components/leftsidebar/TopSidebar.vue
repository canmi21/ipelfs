<!-- components/leftsidebar/TopSidebar.vue -->

<template>
  <div class="top-sidebar" :style="topSidebarDynamicStyle">
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

const topSidebarDynamicStyle = computed(() => ({
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
  height: 4rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  /* justifyContent is now dynamic via :style */
  overflow: hidden;
}
.logo {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
