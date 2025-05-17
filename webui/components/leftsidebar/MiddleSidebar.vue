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
  overflow-y: auto;
  min-height: 0;
  display: flex; /* This ensures SidebarTabList can be aligned if needed, e.g. centered vertically if MiddleSidebar is taller */
  /* For now, SidebarTabList has a fixed height and width: 100% so it will fill. */
}
</style>
