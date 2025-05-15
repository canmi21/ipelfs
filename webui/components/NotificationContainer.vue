<script setup lang="ts">
import { useNotifications } from './../composables/useNotifications'
import NotificationItem from './NotificationItem.vue'

const { notifications, dismissNotification } = useNotifications()

const handleDismiss = (id: string) => {
  dismissNotification(id)
}
</script>

<template>
  <div
    aria-live="assertive"
    class="fixed inset-0 flex flex-col items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-end z-[9999] space-y-4"
  >
    <TransitionGroup name="list" tag="div" class="w-full max-w-sm space-y-4">
      <NotificationItem
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
        @dismiss="handleDismiss"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* Scoped styles for the container if any, most positioning is done by Tailwind classes */
/* Ensure the transition styles from NotificationItem.vue for 'list' are effective or defined globally/here */
</style>
