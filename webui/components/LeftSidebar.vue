<!-- components/LeftSidebar.vue -->

<template>
  <div class="sidebar-internal-layout">
    <TopSidebar />
    <MiddleSidebar v-show="!isCollapsed" />
    <BottomSidebar v-show="!isCollapsed" />
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
  overflow: hidden;
}
</style>
