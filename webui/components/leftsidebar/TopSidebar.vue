<!-- components/leftsidebar/TopSidebar.vue -->

<template>
  <div class="top-sidebar">
    <div class="logo">
      <h2>My App</h2>
    </div>
    <SidebarToggleButton @toggle="onToggleCollapse" />
  </div>
</template>

<script lang="ts">
import SidebarToggleButton from './topsidebar/SidebarToggleButton.vue'

export default {
  name: 'TopSidebar',
  components: {
    SidebarToggleButton,
  },
  emits: ['toggleSidebarCollapse'],
  methods: {
    onToggleCollapse() {
      this.$emit('toggleSidebarCollapse')
    },
  },
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
}
</style>
