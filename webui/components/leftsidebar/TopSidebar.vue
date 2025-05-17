<!-- components/leftsidebar/TopSidebar.vue -->

<template>
  <div class="top-sidebar">
    <div class="logo">
      <h2>My App</h2>
    </div>
  </div>
</template>

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
  display: flex; /* Added for content alignment */
  align-items: center; /* Example alignment */
}
</style>
