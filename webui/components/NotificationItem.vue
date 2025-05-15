<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Notification } from './../composables/useNotifications' // Assuming composables is one level up from components
import { X as IconX } from 'lucide-vue-next' // Only X icon needed from lucide here

const props = defineProps<{
  notification: Notification
}>()

const emit = defineEmits(['dismiss'])

const isHovered = ref(false)

// Updated: Default and 'info' types will use green theme.
// Other types (success, warning, error) will retain their specific colors.
// The border-l-4 and its color are now part of this computed class.
const notificationThemeClasses = computed(() => {
  const baseClasses = 'border-l-4' // Common left border thickness

  switch (props.notification.type) {
    case 'success':
      return `${baseClasses} bg-green-50 dark:bg-green-800 border-green-500 dark:border-green-600`
    case 'warning':
      return `${baseClasses} bg-yellow-50 dark:bg-yellow-800 border-yellow-500 dark:border-yellow-600`
    case 'error':
      return `${baseClasses} bg-red-50 dark:bg-red-800 border-red-500 dark:border-red-600`
    case 'info': // 'info' type now defaults to green
    default: // Default notification style uses green theme
      // Corresponds to --status-connected-color: #1c9376 (similar to Tailwind's green-600/700)
      return `${baseClasses} bg-green-50 dark:bg-green-800 border-green-500 dark:border-green-600`
  }
})

const handleDismiss = () => {
  emit('dismiss', props.notification.id)
}
</script>

<template>
  <div
    class="notification-item w-full max-w-sm rounded-md shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
    :class="[notificationThemeClasses]"
    role="alert"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div class="p-3">
      <div class="flex items-center">
        <div class="w-0 flex-1">
          <p class="text-xs font-medium text-notification-text dark:text-notification-dark-text">
            {{ notification.message }}
          </p>
        </div>
        <div v-if="isHovered" class="ml-2 flex-shrink-0">
          <button
            @click="handleDismiss"
            type="button"
            class="inline-flex rounded-md text-notification-text-muted dark:text-notification-dark-text-muted hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-gray-400 dark:focus:ring-gray-500"
          >
            <span class="sr-only">Close</span>
            <IconX class="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-item {
  /* Base styling for a notification item */
  /* These CSS variables should ideally be defined in your global main.css */
  --text-notification-text: #1f2937; /* gray-800 */
  --text-notification-dark-text: #f3f4f6; /* gray-100 */
  --text-notification-text-muted: #6b7280; /* gray-500 */
  --text-notification-dark-text-muted: #9ca3af; /* gray-400 */
}

.text-notification-text {
  color: var(--text-notification-text);
}
.dark .text-notification-dark-text {
  color: var(--text-notification-dark-text);
}
.text-notification-text-muted {
  color: var(--text-notification-text-muted);
}
.dark .text-notification-dark-text-muted {
  color: var(--text-notification-dark-text-muted);
}

/* Transition styles from NotificationContainer.vue will handle enter/leave for the list */
/* If individual item fade/slide is needed, define .v-enter-active etc. here */
/* For example, for opacity on hover for the X button if not using v-if: */
/*
.close-button-area {
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}
.notification-item:hover .close-button-area {
  opacity: 1;
}
*/

/* Basic enter/leave transitions if this component were to manage its own show/hide via v-show or v-if directly */
/* However, list transitions are handled by NotificationContainer.vue using TransitionGroup */
.v-enter-active,
.v-leave-active {
  transition: all 0.3s ease-out;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateX(30px); /* Slide from right */
}

/* Styles for TransitionGroup in NotificationContainer.vue (if not already global) */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-leave-active {
  position: absolute; /* Important for shuffle animations */
}
</style>
