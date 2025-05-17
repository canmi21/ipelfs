<!-- App.vue -->

<template>
  <div class="flex h-screen">
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
import { computed, onMounted } from 'vue'
import LeftSidebar from './components/LeftSidebar.vue'
import RelativeMain from './components/RelativeMain.vue'
import { useSidebar } from './composables/leftsidebar/useSidebar'

const { isCollapsed } = useSidebar()

const leftSidebarStyle = computed(() => ({
  flexBasis: isCollapsed.value ? '3rem' : '16rem',
  transition: 'flex-basis 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
}))

onMounted(() => {})
</script>

<script lang="ts">
export default {
  name: 'App',
}
</script>

<style>
@import './assets/app/leftsidebar.css';
@import './assets/app/relativemain.css';

.left-sidebar {
  overflow-x: hidden;
}

.relative-main {
  flex: 1;
  overflow-y: auto;
  transition: margin-left 0.3s ease-in-out;
}
</style>
