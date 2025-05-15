import { ref, onMounted, onUnmounted, computed } from 'vue'

function truncate(num: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces)
  return Math.floor(num * factor) / factor
}

export function useBackendStatus(healthCheckUrl = 'http://localhost:33330/v1/ipelfs/healthcheck') {
  const isBackendConnected = ref(true) // Assume connected initially to avoid immediate overlay flash
  const latencyMs = ref<number | null>(null)
  const healthCheckTimerId = ref<number | undefined>(undefined)
  const currentHealthCheckIntervalMs = ref(1000) // Initial interval
  const offlineStartTime = ref<number | null>(null)

  // For manual retry button in modal
  const isRetryingManualCheck = ref(false)
  const manualRetryButtonTimeoutId = ref<number | undefined>(undefined)
  const triggerShake = ref(false) // For retry button shake animation
  const showRetryFailureIcon = ref(false) // To show X icon on retry button

  const formattedLatency = computed(() => {
    const ms = latencyMs.value
    if (ms === null || ms < 0) return null // null for not yet checked or error in calculation
    if (ms === 0) return '0ms' // Unlikely but handle

    const ns = ms * 1_000_000
    if (ms > 0 && ms < 0.001) return `${Math.floor(ns)}ns` // Show nanoseconds for very low latencies

    if (ms < 1000) {
      // Milliseconds
      if (ms < 10) return `${truncate(ms, 2).toFixed(2)}ms`
      if (ms < 100) return `${truncate(ms, 1).toFixed(1)}ms`
      return `${Math.floor(ms)}ms`
    } else {
      // Seconds
      const s = ms / 1000
      if (s < 10) return `${truncate(s, 2).toFixed(2)}s`
      if (s < 100) return `${truncate(s, 1).toFixed(1)}s`
      return `${Math.floor(s)}s`
    }
  })

  const checkBackendStatus = async () => {
    const requestSentTimestamp = Date.now()
    try {
      const response = await fetch(healthCheckUrl) // Use passed URL
      if (response.ok) {
        const data = await response.json()
        if (data.success === true) {
          isBackendConnected.value = true
          try {
            const backendTimestampStr = data.data as string // e.g., "2024-05-14T12:30:05.123456789Z" or "2024-05-14T12:30:05.123Z" or "2024-05-14T12:30:05Z"
            // More robust parsing for various sub-second precision and timezone formats
            const datePart = backendTimestampStr.substring(0, 19) // YYYY-MM-DDTHH:mm:ss
            const fractionalPartMatch = backendTimestampStr.substring(19).match(/\.(\d+)/) // Match fractional seconds
            let timezonePart = 'Z' // Assume Zulu if no explicit offset
            const timezoneMatch = backendTimestampStr.substring(19).match(/[Z+-].*$/) // Match Z or +/-HH:mm or +/-HHmm or +/-HH
            if (timezoneMatch) timezonePart = timezoneMatch[0]

            let backendEpochNs: bigint
            // Construct a date string that Date.parse can reliably handle for the base seconds
            const baseDateForParsing = datePart + timezonePart
            const baseMsBigInt = BigInt(new Date(baseDateForParsing).getTime())

            if (fractionalPartMatch && fractionalPartMatch[1]) {
              // Pad/truncate nanoseconds to ensure 9 digits
              const nanoStr = fractionalPartMatch[1].padEnd(9, '0').substring(0, 9)
              backendEpochNs = baseMsBigInt * 1_000_000n + BigInt(nanoStr)
            } else {
              backendEpochNs = baseMsBigInt * 1_000_000n // No fractional seconds
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
    await checkBackendStatus()

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
      // Max interval: 5000 * 2^6 = 5000 * 64 = 320000ms (approx 5.3 minutes)
      currentHealthCheckIntervalMs.value = 5000 * Math.pow(2, Math.min(minutesOffline, 6))
    }

    healthCheckTimerId.value = window.setTimeout(
      performHealthCheckAndScheduleNext,
      currentHealthCheckIntervalMs.value,
    )
  }

  const triggerManualHealthCheck = async () => {
    if (isRetryingManualCheck.value || showRetryFailureIcon.value) return // Prevent multiple rapid clicks

    isRetryingManualCheck.value = true
    triggerShake.value = false // Reset shake
    showRetryFailureIcon.value = false // Reset failure icon

    // Clear existing timers to avoid interference
    if (healthCheckTimerId.value !== undefined) clearTimeout(healthCheckTimerId.value)
    if (manualRetryButtonTimeoutId.value !== undefined)
      clearTimeout(manualRetryButtonTimeoutId.value)

    // Set a timeout for the retry button visual feedback (e.g., stop spinning, show failure)
    manualRetryButtonTimeoutId.value = window.setTimeout(() => {
      if (!isBackendConnected.value) {
        // If still not connected after timeout
        isRetryingManualCheck.value = false
        showRetryFailureIcon.value = true
        triggerShake.value = true // Trigger shake animation
        setTimeout(() => {
          // Hide shake animation
          triggerShake.value = false
          setTimeout(() => {
            // Reset icon after a bit
            showRetryFailureIcon.value = false
          }, 700) // Duration for icon to show before resetting (if still disconnected)
        }, 300) // Duration of shake
      }
      // If connected, performHealthCheckAndScheduleNext will reset these flags.
    }, 3000) // Timeout for manual retry attempt visual feedback

    await performHealthCheckAndScheduleNext() // This will run checkBackendStatus
  }

  onMounted(() => {
    // Perform an initial check immediately, then schedule regular checks
    checkBackendStatus().then(() => {
      if (isBackendConnected.value) {
        currentHealthCheckIntervalMs.value = 1000
        offlineStartTime.value = null
      } else {
        offlineStartTime.value = Date.now()
        const minutesOffline = 0 // Start with 0 minutes offline for backoff calculation
        currentHealthCheckIntervalMs.value = 5000 * Math.pow(2, Math.min(minutesOffline, 6))
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
    healthCheckTimerId, // expose for sidebar status display
    triggerManualHealthCheck,
    // For modal button state
    isRetryingManualCheck,
    triggerShake,
    showRetryFailureIcon,
  }
}
