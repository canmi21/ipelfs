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
          // hasBeenConnectedAtLeastOnce will be updated via watch or onMounted after this check
          try {
            const backendTimestampStr = data.data as string
            const datePart = backendTimestampStr.substring(0, 19)
            const fractionalPartMatch = backendTimestampStr.substring(19).match(/\.(\d+)/)
            let timezonePart = 'Z'
            const timezoneMatch = backendTimestampStr.substring(19).match(/[Z+-].*$/)
            if (timezoneMatch) timezonePart = timezoneMatch[0]

            const baseDateForParsing = datePart + timezonePart
            const baseMsBigInt = BigInt(new Date(baseDateForParsing).getTime())
            let backendEpochNs: bigint
            if (fractionalPartMatch && fractionalPartMatch[1]) {
              const nanoStr = fractionalPartMatch[1].padEnd(9, '0').substring(0, 9)
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

    if (isBackendConnected.value) {
      currentHealthCheckIntervalMs.value = 1000 // Reset to frequent polling when connected
      offlineStartTime.value = null
      if (isRetryingManualCheck.value) {
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
      const minutesOffline = Math.max(
        0,
        Math.floor((Date.now() - (offlineStartTime.value || Date.now())) / (1000 * 60)),
      )
      currentHealthCheckIntervalMs.value = 5000 * Math.pow(2, Math.min(minutesOffline, 6)) // Max interval: ~5.3 minutes
    }

    healthCheckTimerId.value = window.setTimeout(
      performHealthCheckAndScheduleNext,
      currentHealthCheckIntervalMs.value,
    )
  }

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
      hasBeenConnectedAtLeastOnce.value = true // Always mark if currently connected
    } else {
      // Currently offline (newValue === false)
      if (oldValue === true && hasBeenConnectedAtLeastOnce.value) {
        // Transitioned from online to offline, AND was previously online at some point
        addNotification({
          message: 'Backend connection lost.',
          type: 'error',
          duration: 2100,
        })
      }
    }
  })

  const triggerManualHealthCheck = async () => {
    if (isRetryingManualCheck.value || showRetryFailureIcon.value) return // Prevent multiple rapid clicks

    isRetryingManualCheck.value = true
    triggerShake.value = false
    showRetryFailureIcon.value = false

    if (healthCheckTimerId.value !== undefined) clearTimeout(healthCheckTimerId.value)
    if (manualRetryButtonTimeoutId.value !== undefined)
      clearTimeout(manualRetryButtonTimeoutId.value)

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
    checkBackendStatus().then(() => {
      // After the first check, if we are connected, ensure hasBeenConnectedAtLeastOnce is true.
      // The watch will also run and set this, but setting it here directly after the first
      // successful check is a safeguard.
      if (isBackendConnected.value) {
        hasBeenConnectedAtLeastOnce.value = true
      }

      // Subsequent scheduling based on the first check's outcome
      if (isBackendConnected.value) {
        currentHealthCheckIntervalMs.value = 1000
        offlineStartTime.value = null
      } else {
        // If starting offline, the watch ensures no "connection lost" if hasBeenConnectedAtLeastOnce is false
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
    healthCheckTimerId, // Exposed for potential display in UI
    triggerManualHealthCheck,
    isRetryingManualCheck, // States for modal button UI
    triggerShake,
    showRetryFailureIcon,
    // hasBeenConnectedAtLeastOnce, // Optionally expose this state
  }
}
