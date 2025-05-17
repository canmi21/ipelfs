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
.top-sidebar {
  padding: 1rem;
  background-color: #f9f9f9; /* Matches the general sidebar background from the global css */
  border-bottom: 1px solid #ddd;
  height: 4rem; /* Fixed height for the top section */
  flex-shrink: 0; /* Prevent shrinking if space is tight (though fixed height usually suffices) */
}

.dark .top-sidebar {
  /* Dark mode styling */
  background-color: #171717;
  border-bottom: 1px solid #333;
}

.logo h2 {
  font-size: 1.5rem;
  color: #333;
  margin: 0; /* Reset default margin */
}

.dark .logo h2 {
  /* Dark mode styling */
  color: #fff;
}
</style>
