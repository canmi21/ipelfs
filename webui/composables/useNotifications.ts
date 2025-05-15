import { ref, readonly } from 'vue'

export interface Notification {
  id: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  duration?: number // in milliseconds
}

const notifications = ref<Notification[]>([])
const notificationTimeouts = new Map<string, number>()

let nextId = 0

export function useNotifications() {
  const addNotification = (notificationDetails: Omit<Notification, 'id'>) => {
    const id = `notification-${nextId++}`
    const duration = notificationDetails.duration ?? 5000 // Default duration 5 seconds

    notifications.value.push({
      ...notificationDetails,
      id,
      duration, // Store actual duration used
    })

    const timeoutId = window.setTimeout(() => {
      dismissNotification(id)
    }, duration)
    notificationTimeouts.set(id, timeoutId)

    return id
  }

  const dismissNotification = (id: string) => {
    notifications.value = notifications.value.filter((n) => n.id !== id)
    if (notificationTimeouts.has(id)) {
      clearTimeout(notificationTimeouts.get(id))
      notificationTimeouts.delete(id)
    }
  }

  return {
    notifications: readonly(notifications), // Expose as readonly to prevent external modification
    addNotification,
    dismissNotification,
  }
}
