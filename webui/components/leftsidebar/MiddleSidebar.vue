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
.middle-sidebar {
  flex-grow: 1; /* Allows this section to take up all available vertical space after Top and Bottom sidebars. */
  padding: 1rem;
  background-color: #ffffff; /* Assuming light mode background for this section */
  overflow-y: auto; /* If content overflows, a scrollbar will appear ONLY for this middle section. */
  min-height: 0; /* Often necessary for flex children to allow them to shrink and enable scrolling correctly. */
}

.dark .middle-sidebar {
  /* Example for dark mode styling if needed */
  background-color: #2d2d2d;
  color: #e0e0e0;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0; /* Good practice to reset default margin */
}

li {
  padding: 10px 0;
  cursor: pointer;
}

/* Example: Dark mode for list items */
.dark .middle-sidebar li {
  /* Adjust color or other properties for dark mode */
}
</style>
