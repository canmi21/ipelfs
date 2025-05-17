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
.bottom-sidebar {
  padding: 1rem;
  background-color: #f9f9f9; /* Matches the general sidebar background */
  border-top: 1px solid #ddd;
  height: 4rem; /* Fixed height for the bottom section */
  flex-shrink: 0; /* Prevent shrinking */
}

.dark .bottom-sidebar {
  /* Dark mode styling */
  background-color: #171717;
  border-top: 1px solid #333;
}

.settings button {
  padding: 0.5rem 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.dark .settings button {
  /* Example dark mode for button */
  background-color: #388e3c;
}
</style>
