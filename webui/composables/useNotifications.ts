import { ref, readonly } from 'vue'

export interface Notification {
  id: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  duration: number // Original total duration in milliseconds. 0 means permanent.
  remainingDuration: number // Time left. For permanent, this could be Infinity or not used for timers.
  startTime?: number
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
    // If duration is explicitly 0, it's permanent. Otherwise, default to 5000ms if undefined.
    const duration = notificationDetails.duration === 0 ? 0 : (notificationDetails.duration ?? 5000)
    const isPermanent = duration === 0

    const newNotification: Notification = {
      ...notificationDetails,
      id,
      duration,
      remainingDuration: isPermanent ? Infinity : duration, // Use Infinity for permanent, or actual duration
      isPaused: false,
      startTime: Date.now(), // Set start time for all notifications
    }

    if (!isPermanent) {
      newNotification.timerId = window.setTimeout(() => {
        dismissNotification(id)
      }, duration)
    }

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
    // Only pause if not permanent and not already paused
    if (notification && notification.duration !== 0 && !notification.isPaused) {
      clearTimeout(notification.timerId)
      const elapsed = Date.now() - (notification.startTime || Date.now())
      notification.remainingDuration = Math.max(0, notification.remainingDuration - elapsed)
      notification.isPaused = true
      // Force reactivity for computed properties in NotificationItem
      const index = notifications.value.findIndex((n) => n.id === id)
      if (index !== -1) {
        notifications.value.splice(index, 1, { ...notification })
      }
    }
  }

  const resumeNotification = (id: string) => {
    const notification = notifications.value.find((n) => n.id === id)
    // Only resume if not permanent and is paused
    if (notification && notification.duration !== 0 && notification.isPaused) {
      notification.startTime = Date.now()
      notification.isPaused = false
      // Only set timeout if remainingDuration is finite and positive
      if (isFinite(notification.remainingDuration) && notification.remainingDuration > 0) {
        notification.timerId = window.setTimeout(() => {
          dismissNotification(id)
        }, notification.remainingDuration)
      } else if (notification.remainingDuration <= 0) {
        // If somehow remaining duration is zero or less, dismiss immediately
        dismissNotification(id)
        return // Exit early
      }
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
