<!-- components/LeftSidebar.vue -->

<template>
  <div class="sidebar-internal-layout">
    <TopSidebar />
    <hr class="sidebar-divider" />
    <MiddleSidebar v-show="!isCollapsed" />
    <hr class="sidebar-divider" v-show="!isCollapsed" />
    <BottomSidebar />
  </div>
</template>

<script lang="ts" setup>
import TopSidebar from './leftsidebar/TopSidebar.vue'
import MiddleSidebar from './leftsidebar/MiddleSidebar.vue'
import BottomSidebar from './leftsidebar/BottomSidebar.vue'
import { useSidebarState } from '../composables/leftsidebar/topsidebar/useSidebarToggleButton'

const { isCollapsed } = useSidebarState()
</script>

<script lang="ts">
export default {
  name: 'LeftSidebar',
}
</script>

<style scoped>
.sidebar-internal-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden; /* Keep this to hide parts of children if they overflow during transition */
}

.sidebar-divider {
  border: none;
  border-top: 1px solid var(--color-border-primary);
  margin: 0 0.5rem; /* 0 top/bottom margin, 0.5rem left/right margin for gap */
  flex-shrink: 0; /* Prevent divider from shrinking */
}
</style>
