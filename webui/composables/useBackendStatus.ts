import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useNotifications } from './useNotifications'

function truncate(num: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces)
  return Math.floor(num * factor) / factor
}

export function useBackendStatus(healthCheckUrl = 'http://localhost:33330/v1/ipelfs/healthcheck') {
  const { addNotification } = useNotifications() // Get notification dispatch method

  const isBackendConnected = ref(true) // Initial assumption: connected, to prevent initial modal flash
  const hasBeenConnectedAtLeastOnce = ref(false) // Tracks if backend was successfully connected at least once

  const latencyMs = ref<number | null>(null)
  const healthCheckTimerId = ref<number | undefined>(undefined)
  const currentHealthCheckIntervalMs = ref(1000) // Initial interval for health checks
  const offlineStartTime = ref<number | null>(null)

  // For manual retry button in ConnectionLostModal
  const isRetryingManualCheck = ref(false)
  const manualRetryButtonTimeoutId = ref<number | undefined>(undefined)
  const triggerShake = ref(false)
  const showRetryFailureIcon = ref(false)

  const formattedLatency = computed(() => {
    const ms = latencyMs.value
    if (ms === null || ms < 0) return null // Not checked yet or error in calculation
    if (ms === 0) return '0ms' // Unlikely, but handle

    const ns = ms * 1_000_000
    if (ms > 0 && ms < 0.001) return `${Math.floor(ns)}ns` // Show nanoseconds for very low latencies

    if (ms < 1000) {
      if (ms < 10) return `${truncate(ms, 2).toFixed(2)}ms`
      if (ms < 100) return `${truncate(ms, 1).toFixed(1)}ms`
      return `${Math.floor(ms)}ms`
    } else {
      const s = ms / 1000
      if (s < 10) return `${truncate(s, 2).toFixed(2)}s`
      if (s < 100) return `${truncate(s, 1).toFixed(1)}s`
      return `${Math.floor(s)}s`
    }
  })

  const checkBackendStatus = async () => {
    const requestSentTimestamp = Date.now()
    try {
      const response = await fetch(healthCheckUrl)
      if (response.ok) {
        const data = await response.json()
        if (data.success === true) {
          isBackendConnected.value = true
          try {
            const backendTimestampStr = data.data as string
            const datePart = backendTimestampStr.substring(0, 19) // YYYY-MM-DDTHH:mm:ss
            const fractionalPartMatch = backendTimestampStr.substring(19).match(/\.(\d+)/)
            let timezonePart = 'Z' // Assume Zulu if no explicit offset
            const timezoneMatch = backendTimestampStr.substring(19).match(/[Z+-].*$/)
            if (timezoneMatch) timezonePart = timezoneMatch[0]

            const baseDateForParsing = datePart + timezonePart
            const baseMsBigInt = BigInt(new Date(baseDateForParsing).getTime())
            let backendEpochNs: bigint
            if (fractionalPartMatch && fractionalPartMatch[1]) {
              const nanoStr = fractionalPartMatch[1].padEnd(9, '0').substring(0, 9) // Ensure 9 digits for nanoseconds
              backendEpochNs = baseMsBigInt * 1_000_000n + BigInt(nanoStr)
            } else {
              backendEpochNs = baseMsBigInt * 1_000_000n
            }
            const requestSentEpochNs = BigInt(requestSentTimestamp) * 1_000_000n
            latencyMs.value = Number(backendEpochNs - requestSentEpochNs) / 1_000_000.0
          } catch (e) {
            console.error('Error parsing backend timestamp or calculating latency:', e)
            latencyMs.value = -1 // Indicate an error in latency calculation
          }
        } else {
          isBackendConnected.value = false
          latencyMs.value = null
        }
      } else {
        console.warn(`Health check received non-ok status: ${response.status}`)
        isBackendConnected.value = false
        latencyMs.value = null
      }
    } catch (error) {
      console.error('Health check request failed:', error)
      isBackendConnected.value = false
      latencyMs.value = null
    }
  }

  const performHealthCheckAndScheduleNext = async () => {
    if (healthCheckTimerId.value !== undefined) {
      clearTimeout(healthCheckTimerId.value)
    }
    await checkBackendStatus() // isBackendConnected is updated here

    // Notification logic is handled by the watch on isBackendConnected below

    if (isBackendConnected.value) {
      currentHealthCheckIntervalMs.value = 1000 // Reset to frequent polling when connected
      offlineStartTime.value = null
      if (isRetryingManualCheck.value) {
        // If manual retry succeeded
        isRetryingManualCheck.value = false
        showRetryFailureIcon.value = false
        if (manualRetryButtonTimeoutId.value !== undefined) {
          clearTimeout(manualRetryButtonTimeoutId.value)
          manualRetryButtonTimeoutId.value = undefined
        }
      }
    } else {
      if (offlineStartTime.value === null) {
        offlineStartTime.value = Date.now()
      }
      // Exponential backoff for polling when offline
      const minutesOffline = Math.max(
        0,
        Math.floor((Date.now() - (offlineStartTime.value || Date.now())) / (1000 * 60)),
      )
      // Max interval: 5000 * 2^6 = 320,000ms (approx 5.3 minutes)
      currentHealthCheckIntervalMs.value = 5000 * Math.pow(2, Math.min(minutesOffline, 6))
    }

    healthCheckTimerId.value = window.setTimeout(
      performHealthCheckAndScheduleNext,
      currentHealthCheckIntervalMs.value,
    )
  }

  // Watch for connection status changes to trigger notifications
  watch(isBackendConnected, (newValue, oldValue) => {
    if (newValue === true) {
      // Currently online
      if (oldValue === false) {
        // Transitioned from offline to online (reconnected)
        addNotification({
          message: 'Successfully reconnected to the backend!',
          type: 'success',
          duration: 2100,
        })
      }
      hasBeenConnectedAtLeastOnce.value = true // Mark as connected at least once
    } else {
      // Currently offline (newValue === false)
      if (oldValue === true && hasBeenConnectedAtLeastOnce.value) {
        // Transitioned from online to offline, AND was previously online
        addNotification({
          message: 'Backend connection lost. Attempting to reconnect...',
          type: 'error',
          duration: 5000,
        })
      }
    }
  })

  const triggerManualHealthCheck = async () => {
    if (isRetryingManualCheck.value || showRetryFailureIcon.value) return // Prevent multiple rapid clicks

    isRetryingManualCheck.value = true
    triggerShake.value = false // Reset shake animation flag
    showRetryFailureIcon.value = false // Reset failure icon flag

    // Clear existing timers to avoid interference
    if (healthCheckTimerId.value !== undefined) clearTimeout(healthCheckTimerId.value)
    if (manualRetryButtonTimeoutId.value !== undefined)
      clearTimeout(manualRetryButtonTimeoutId.value)

    // Set a timeout for the retry button visual feedback
    manualRetryButtonTimeoutId.value = window.setTimeout(() => {
      if (!isBackendConnected.value) {
        // If still not connected after timeout
        isRetryingManualCheck.value = false
        showRetryFailureIcon.value = true
        triggerShake.value = true
        setTimeout(() => {
          triggerShake.value = false
          setTimeout(() => {
            showRetryFailureIcon.value = false
          }, 700)
        }, 300)
      }
    }, 3000)
    await performHealthCheckAndScheduleNext() // This will run checkBackendStatus
  }

  onMounted(() => {
    // Perform initial health check
    checkBackendStatus().then(() => {
      // Subsequent scheduling based on the first check's outcome
      if (isBackendConnected.value) {
        currentHealthCheckIntervalMs.value = 1000
        offlineStartTime.value = null
      } else {
        offlineStartTime.value = Date.now()
        currentHealthCheckIntervalMs.value = 5000 * Math.pow(2, 0) // Initial 5s backoff
      }
      healthCheckTimerId.value = window.setTimeout(
        performHealthCheckAndScheduleNext,
        currentHealthCheckIntervalMs.value,
      )
    })
  })

  onUnmounted(() => {
    if (healthCheckTimerId.value !== undefined) clearTimeout(healthCheckTimerId.value)
    if (manualRetryButtonTimeoutId.value !== undefined)
      clearTimeout(manualRetryButtonTimeoutId.value)
  })

  return {
    isBackendConnected,
    latencyMs,
    formattedLatency,
    healthCheckTimerId, // Exposed for potential display in UI (e.g., sidebar status)
    triggerManualHealthCheck,
    // States for modal button UI
    isRetryingManualCheck,
    triggerShake,
    showRetryFailureIcon,
    // hasBeenConnectedAtLeastOnce, // Optionally expose this state if needed elsewhere
  }
}
