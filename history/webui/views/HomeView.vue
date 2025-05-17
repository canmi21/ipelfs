<script setup lang="ts"></script>

<template>
  <div class="p-4 md:p-6">
    <h1 class="text-2xl font-semibold mb-4 text-main-color dark:text-dark-main-color">
      Insights View
    </h1>
    <p class="text-main-color-muted dark:text-dark-main-color-muted">
      This page will display various insights. Multiple notifications should appear on load.
    </p>
  </div>
</template>

<style scoped>
/* Add any specific styles for InsightsView if needed */
/* Example text color, assuming you have these CSS variables defined in main.css */
.text-main-color {
  color: var(--text-main-color);
}
.dark .text-dark-main-color {
  /* Ensure this variable is correctly defined in your main.css for dark mode text */
  color: var(--text-main-color-dark, var(--text-main-color));
}
.text-main-color-muted {
  color: var(--sidebar-text-muted); /* Example variable, use appropriate one */
}
.dark .text-dark-main-color-muted {
  /* Ensure this variable is correctly defined for dark mode muted text */
  color: var(--sidebar-text-muted-dark, var(--sidebar-text-muted));
}
</style>
