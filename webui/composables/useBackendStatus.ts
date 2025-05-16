import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useNotifications } from './useNotifications'
import { buildApiUrl } from './../config/api'

function truncate(num: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces)
  return Math.floor(num * factor) / factor
}

export function useBackendStatus(/* healthCheckUrl can be removed or made optional for override */) {
  const { addNotification } = useNotifications()

  const healthCheckUrl = buildApiUrl('/v1/ipelfs/healthcheck')

  const isBackendConnected = ref(true)
  const hasBeenConnectedAtLeastOnce = ref(false)

  const latencyMs = ref<number | null>(null)
  const healthCheckTimerId = ref<number | undefined>(undefined)
  const currentHealthCheckIntervalMs = ref(1000)
  const offlineStartTime = ref<number | null>(null)

  const isRetryingManualCheck = ref(false)
  const manualRetryButtonTimeoutId = ref<number | undefined>(undefined)
  const triggerShake = ref(false)
  const showRetryFailureIcon = ref(false)

  const formattedLatency = computed(() => {
    const ms = latencyMs.value
    if (ms === null || ms < 0) return null
    if (ms === 0) return '0ms'

    const ns = ms * 1_000_000
    if (ms > 0 && ms < 0.001) return `${Math.floor(ns)}ns`

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
      const response = await fetch(healthCheckUrl) // 使用从配置构建的URL
      if (response.ok) {
        const data = await response.json()
        if (data.success === true) {
          isBackendConnected.value = true
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
    await checkBackendStatus()

    if (isBackendConnected.value) {
      currentHealthCheckIntervalMs.value = 1000
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
      currentHealthCheckIntervalMs.value = 5000 * Math.pow(2, Math.min(minutesOffline, 6))
    }

    healthCheckTimerId.value = window.setTimeout(
      performHealthCheckAndScheduleNext,
      currentHealthCheckIntervalMs.value,
    )
  }

  watch(isBackendConnected, (newValue, oldValue) => {
    if (newValue === true) {
      if (oldValue === false) {
        addNotification({
          message: 'Successfully reconnected to the backend!',
          type: 'success',
          duration: 2100,
        })
      }
      hasBeenConnectedAtLeastOnce.value = true
    } else {
      if (oldValue === true && hasBeenConnectedAtLeastOnce.value) {
        addNotification({
          message: 'Backend connection lost.',
          type: 'error',
          duration: 5200,
        })
      }
    }
  })

  const triggerManualHealthCheck = async () => {
    if (isRetryingManualCheck.value || showRetryFailureIcon.value) return

    isRetryingManualCheck.value = true
    triggerShake.value = false
    showRetryFailureIcon.value = false

    if (healthCheckTimerId.value !== undefined) clearTimeout(healthCheckTimerId.value)
    if (manualRetryButtonTimeoutId.value !== undefined)
      clearTimeout(manualRetryButtonTimeoutId.value)

    manualRetryButtonTimeoutId.value = window.setTimeout(() => {
      if (!isBackendConnected.value) {
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
    await performHealthCheckAndScheduleNext()
  }

  onMounted(() => {
    checkBackendStatus().then(() => {
      if (isBackendConnected.value) {
        hasBeenConnectedAtLeastOnce.value = true
      }
      if (isBackendConnected.value) {
        currentHealthCheckIntervalMs.value = 1000
        offlineStartTime.value = null
      } else {
        offlineStartTime.value = Date.now()
        currentHealthCheckIntervalMs.value = 5000 * Math.pow(2, 0)
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
    healthCheckTimerId,
    triggerManualHealthCheck,
    isRetryingManualCheck,
    triggerShake,
    showRetryFailureIcon,
  }
}
