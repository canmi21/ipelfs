<script setup lang="ts">
import { computed } from 'vue'
import type { Notification } from './../composables/useNotifications'
import { X as IconX, Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-vue-next'

const props = defineProps<{
  notification: Notification
}>()

const emit = defineEmits(['dismiss'])

const iconComponent = computed(() => {
  switch (props.notification.type) {
    case 'success':
      return CheckCircle2
    case 'warning':
      return AlertTriangle
    case 'error':
      return AlertCircle
    case 'info':
    default:
      return Info
  }
})

const iconColorClass = computed(() => {
  switch (props.notification.type) {
    case 'success':
      return 'text-green-500 dark:text-green-400'
    case 'warning':
      return 'text-yellow-500 dark:text-yellow-400'
    case 'error':
      return 'text-red-500 dark:text-red-400'
    case 'info':
    default:
      return 'text-blue-500 dark:text-blue-400'
  }
})

const bgColorClass = computed(() => {
  // Using slightly transparent backgrounds for better blending, can be customized
  switch (props.notification.type) {
    case 'success':
      return 'bg-green-50 dark:bg-green-900 border-green-500 dark:border-green-700'
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-900 border-yellow-500 dark:border-yellow-700'
    case 'error':
      return 'bg-red-50 dark:bg-red-900 border-red-500 dark:border-red-700'
    case 'info':
    default:
      return 'bg-blue-50 dark:bg-blue-900 border-blue-500 dark:border-blue-700'
  }
})

const handleDismiss = () => {
  emit('dismiss', props.notification.id)
}

// Note: Auto-dismissal is handled by the useNotifications composable timer
</script>

<template>
  <div
    class="notification-item w-full max-w-sm rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden border-l-4"
    :class="[bgColorClass]"
    role="alert"
  >
    <div class="p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0 pt-0.5">
          <component
            :is="iconComponent"
            class="w-6 h-6"
            :class="iconColorClass"
            aria-hidden="true"
          />
        </div>
        <div class="ml-3 w-0 flex-1">
          <p class="text-sm font-medium text-notification-text dark:text-notification-dark-text">
            {{ notification.message }}
          </p>
        </div>
        <div class="ml-4 flex-shrink-0 flex">
          <button
            @click="handleDismiss"
            type="button"
            class="inline-flex rounded-md text-notification-text-muted dark:text-notification-dark-text-muted hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span class="sr-only">Close</span>
            <IconX class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-item {
  /* Base styling for a notification item */
  /* Colors for text are examples, should be defined in main.css as CSS variables if possible */
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

/* Basic enter/leave transitions */
.v-enter-active,
.v-leave-active {
  transition: all 0.3s ease-out;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
/* For stacked notifications, you might want a list transition */
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>
