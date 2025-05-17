<!-- components/leftsidebar/MiddleSidebar.vue -->

<template>
  <div class="middle-sidebar">
    <ul>
      <li>Home</li>
      <li>Activity</li>
      <li>Collections</li>
      <li>Volumes</li>
    </ul>
  </div>
</template>

<script lang="ts">
export default {
  name: 'MiddleSidebar',
}
</script>

<style scoped>
@import '../../assets/app/leftsidebar/middlesidebar.css';

.middle-sidebar {
  flex-grow: 1;
  overflow-y: auto;
  min-height: 0; /* Important for flex-grow and overflow to work correctly */
}
</style>
