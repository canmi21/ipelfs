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
  onManuallyDismissed?: () => void // New: Callback for manual dismissal
}

const notifications = ref<Notification[]>([])
let nextId = 0

export function useNotifications() {
  const addNotification = (
    notificationDetails: Omit<
      Notification,
      'id' | 'remainingDuration' | 'isPaused' | 'duration'
    > & { duration?: number; onManuallyDismissed?: () => void }, // Add onManuallyDismissed here
  ) => {
    const id = `notification-${nextId++}`
    const duration = notificationDetails.duration === 0 ? 0 : (notificationDetails.duration ?? 5000)
    const isPermanent = duration === 0

    const newNotification: Notification = {
      message: notificationDetails.message,
      type: notificationDetails.type,
      // onManuallyDismissed must be explicitly passed if needed
      onManuallyDismissed: notificationDetails.onManuallyDismissed,
      id,
      duration,
      remainingDuration: isPermanent ? Infinity : duration,
      isPaused: false,
      startTime: Date.now(),
    }

    if (!isPermanent) {
      newNotification.timerId = window.setTimeout(() => {
        // Automatic dismissal is NOT manual
        dismissNotification(id, false)
      }, duration)
    }

    notifications.value.push(newNotification)
    return id
  }

  // Add isManualDismiss parameter
  const dismissNotification = (id: string, isManualDismiss: boolean = false) => {
    const notificationIndex = notifications.value.findIndex((n) => n.id === id)
    if (notificationIndex > -1) {
      const notification = notifications.value[notificationIndex]
      if (notification.timerId) {
        clearTimeout(notification.timerId)
      }

      // If dismissed manually and a callback exists, execute it
      if (isManualDismiss && typeof notification.onManuallyDismissed === 'function') {
        notification.onManuallyDismissed()
      }

      notifications.value.splice(notificationIndex, 1)
    }
  }

  const pauseNotification = (id: string) => {
    const notification = notifications.value.find((n) => n.id === id)
    if (notification && notification.duration !== 0 && !notification.isPaused) {
      clearTimeout(notification.timerId)
      const elapsed = Date.now() - (notification.startTime || Date.now())
      notification.remainingDuration = Math.max(0, notification.remainingDuration - elapsed)
      notification.isPaused = true
      const index = notifications.value.findIndex((n) => n.id === id)
      if (index !== -1) {
        notifications.value.splice(index, 1, { ...notification })
      }
    }
  }

  const resumeNotification = (id: string) => {
    const notification = notifications.value.find((n) => n.id === id)
    if (notification && notification.duration !== 0 && notification.isPaused) {
      notification.startTime = Date.now()
      notification.isPaused = false
      if (isFinite(notification.remainingDuration) && notification.remainingDuration > 0) {
        notification.timerId = window.setTimeout(() => {
          // Automatic dismissal is NOT manual
          dismissNotification(id, false)
        }, notification.remainingDuration)
      } else if (notification.remainingDuration <= 0 && notification.duration !== 0) {
        dismissNotification(id, false) // Not manual
        return
      }
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
