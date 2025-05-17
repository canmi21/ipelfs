<!-- components/leftsidebar/BottomSidebar.vue -->

<template>
  <div class="bottom-sidebar">
    <div class="settings">
      <button>Settings</button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'BottomSidebar',
}
</script>

<style scoped>
@import '../../assets/app/leftsidebar/bottomsidebar.css';

.bottom-sidebar {
  height: 4rem;
  flex-shrink: 0;
  display: flex; /* Added for content alignment if needed */
  align-items: center; /* Example alignment */
}
</style>
