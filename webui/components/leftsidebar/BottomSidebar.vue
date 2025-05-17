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
  display: flex;
  align-items: center;
}
.settings {
  /* Layout for settings content if needed */
  width: 100%; /* Example: make settings area take full width for button alignment */
  display: flex; /* Example for button alignment */
  justify-content: flex-start; /* Example: Align button to start */
}
</style>
