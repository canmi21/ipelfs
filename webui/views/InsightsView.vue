<script setup lang="ts">
import { onMounted } from 'vue'
import { useNotifications } from './../composables/useNotifications'

const { addNotification } = useNotifications()

onMounted(() => {
  addNotification({
    message: 'Hello from InsightsView!',
    type: 'info', // Optional: 'success', 'warning', 'error'
    duration: 5000, // Optional: duration in milliseconds
  })
})

// Example function to trigger another notification, e.g., from a button click
// const sendAnotherNotification = () => {
//   addNotification({
//     message: 'This is another notification!',
//     type: 'success',
//   });
// };
</script>

<template>
  <div class="p-4 md:p-6">
    <h1 class="text-2xl font-semibold mb-4 text-main-color dark:text-dark-main-color">
      Insights View
    </h1>
    <p class="text-main-color-muted dark:text-dark-main-color-muted">
      This page will display various insights. A notification "Hello from InsightsView!" should
      appear on load.
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
  color: var(
    --text-main-color
  ); /* This should be your dark mode text color, e.g., --dark-text-main-color */
}
.text-main-color-muted {
  color: var(--sidebar-text-muted); /* Example variable, use appropriate one */
}
.dark .text-dark-main-color-muted {
  color: var(--sidebar-text-muted); /* Example variable, use appropriate dark one */
}
</style>
