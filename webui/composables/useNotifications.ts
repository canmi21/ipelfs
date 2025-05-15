// webui/composables/useNotifications.ts
import { ref, readonly } from 'vue'

export interface Notification {
  id: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  duration: number // Original total duration in milliseconds
  remainingDuration: number // Time left in milliseconds
  startTime?: number // Timestamp when the current countdown started/resumed
  isPaused: boolean
  timerId?: number
}

const notifications = ref<Notification[]>([])
let nextId = 0

export function useNotifications() {
  const addNotification = (
    notificationDetails: Omit<
      Notification,
      'id' | 'remainingDuration' | 'isPaused' | 'duration'
    > & { duration?: number },
  ) => {
    const id = `notification-${nextId++}`
    const duration = notificationDetails.duration ?? 5000 // Default duration 5 seconds

    const newNotification: Notification = {
      ...notificationDetails,
      id,
      duration,
      remainingDuration: duration,
      isPaused: false,
      startTime: Date.now(),
    }

    newNotification.timerId = window.setTimeout(() => {
      dismissNotification(id)
    }, duration)

    notifications.value.push(newNotification)
    return id
  }

  const dismissNotification = (id: string) => {
    const notificationIndex = notifications.value.findIndex((n) => n.id === id)
    if (notificationIndex > -1) {
      const notification = notifications.value[notificationIndex]
      if (notification.timerId) {
        clearTimeout(notification.timerId)
      }
      notifications.value.splice(notificationIndex, 1)
    }
  }

  const pauseNotification = (id: string) => {
    const notification = notifications.value.find((n) => n.id === id)
    if (notification && !notification.isPaused) {
      clearTimeout(notification.timerId)
      const elapsed = Date.now() - (notification.startTime || Date.now())
      notification.remainingDuration = Math.max(0, notification.remainingDuration - elapsed)
      notification.isPaused = true
      // Force reactivity for computed properties in NotificationItem if needed
      const index = notifications.value.findIndex((n) => n.id === id)
      if (index !== -1) {
        notifications.value.splice(index, 1, { ...notification })
      }
    }
  }

  const resumeNotification = (id: string) => {
    const notification = notifications.value.find((n) => n.id === id)
    if (notification && notification.isPaused) {
      notification.startTime = Date.now()
      notification.isPaused = false
      notification.timerId = window.setTimeout(() => {
        dismissNotification(id)
      }, notification.remainingDuration)
      // Force reactivity
      const index = notifications.value.findIndex((n) => n.id === id)
      if (index !== -1) {
        notifications.value.splice(index, 1, { ...notification })
      }
    }
  }

  return {
    notifications: readonly(notifications),
    addNotification,
    dismissNotification,
    pauseNotification,
    resumeNotification,
  }
}
