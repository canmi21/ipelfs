<!-- components/leftsidebar/MiddleSidebar.vue -->

<template>
  <div class="middle-sidebar">
    <SidebarTabList :is-sidebar-collapsed="isParentCollapsed" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import SidebarTabList from './middlesidebar/SidebarTabList.vue'

export default defineComponent({
  name: 'MiddleSidebar',
  components: {
    SidebarTabList,
  },
  props: {
    isParentCollapsed: {
      type: Boolean,
      required: true,
    },
  },
})
</script>

<style scoped>
@import '../../assets/app/leftsidebar/middlesidebar.css';

.middle-sidebar {
  flex-grow: 1;
  overflow-y: auto; /* Allow vertical scrolling for content */
  overflow-x: hidden; /* Prevent horizontal scrolling during transitions */
  min-height: 0;
  display: flex;
}
</style>
