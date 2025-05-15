<script setup lang="ts">
import { onMounted } from 'vue'
import { useNotifications } from './../composables/useNotifications' // Corrected path

const { addNotification } = useNotifications()

onMounted(() => {
  const notificationDuration = 30000 // 30 seconds

  // Send an 'info' (default green) notification
  addNotification({
    message: 'Welcome to Insights! This is an info (default green) notification.',
    type: 'info',
    duration: notificationDuration,
  })

  // Send a 'success' (green) notification
  addNotification({
    message: 'Successfully loaded initial data. This is a success notification.',
    type: 'success',
    duration: notificationDuration,
  })

  // Send a 'warning' (yellow) notification
  addNotification({
    message: 'Attention: Some metrics are nearing their thresholds. This is a warning.',
    type: 'warning',
    duration: notificationDuration,
  })

  // Send an 'error' (red) notification
  addNotification({
    message: 'Critical Error: Failed to connect to a data source. This is an error.',
    type: 'error',
    duration: notificationDuration,
  })
})
</script>

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
