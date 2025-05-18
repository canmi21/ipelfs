// composables/useWebSocket.ts

import { ref, readonly, shallowRef, type Ref } from 'vue'
import { getAbsoluteApiUrl } from './useApiUrl'

export type WebSocketStatus = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' | 'ERROR' | 'INITIAL'

const IS_CLIENT = typeof window !== 'undefined'

// --- Module-scoped singleton state and instance ---
const status = ref<WebSocketStatus>('INITIAL')
const data = shallowRef<unknown | null>(null)
const errorEvent = shallowRef<Event | CloseEvent | null>(null)
let wsInstance: WebSocket | null = null
let configuredWebSocketUrl: string | null = null // Stores the fully corrected ws:// or wss:// URL
// --- End of module-scoped state ---

// Internal connect function, uses the configured URL
const _internalConnectAttempt = () => {
  if (!IS_CLIENT || !configuredWebSocketUrl) {
    if (!configuredWebSocketUrl) console.error('WebSocket (Global): URL not configured.')
    if (!IS_CLIENT)
      console.log('WebSocket (Global): Connection attempt skipped (SSR or non-client environment).')
    status.value = 'ERROR' // Cannot connect without URL or on server
    return
  }

  if (wsInstance && (status.value === 'OPEN' || status.value === 'CONNECTING')) {
    console.log(`WebSocket (Global): Already open or connecting to ${configuredWebSocketUrl}.`)
    return
  }

  console.log(`WebSocket (Global): Attempting to connect to ${configuredWebSocketUrl}`)
  status.value = 'CONNECTING'
  data.value = null
  errorEvent.value = null

  try {
    wsInstance = new WebSocket(configuredWebSocketUrl)

    wsInstance.onopen = () => {
      status.value = 'OPEN'
      console.log(`WebSocket (Global): Connected to ${configuredWebSocketUrl}`)
    }

    wsInstance.onmessage = (event) => {
      console.log('WebSocket (Global): Message received:', event.data)
      data.value = event.data
    }

    wsInstance.onerror = (event) => {
      status.value = 'ERROR'
      errorEvent.value = event
      console.error('WebSocket (Global): Error for connection to', configuredWebSocketUrl, event)
    }

    wsInstance.onclose = (event: CloseEvent) => {
      status.value = 'CLOSED'
      errorEvent.value = event
      console.log(
        `WebSocket (Global): Disconnected from ${configuredWebSocketUrl}`,
        `Code: ${event.code}, Reason: "${event.reason}", Clean: ${event.wasClean}`,
      )
      wsInstance = null // Allow re-connection by calling connect() again
    }
  } catch (err) {
    console.error(
      `WebSocket (Global): Failed to create connection to ${configuredWebSocketUrl}:`,
      err,
    )
    status.value = 'ERROR'
    wsInstance = null
  }
}

// Exposed connect function - configures URL on first call with endpoint, then connects
const connect = (relativeEndpoint?: string) => {
  if (relativeEndpoint && !configuredWebSocketUrl) {
    // Configure URL only if provided and not already set
    const absoluteUrl = getAbsoluteApiUrl(relativeEndpoint)
    if (absoluteUrl.startsWith('http://')) {
      configuredWebSocketUrl = absoluteUrl.replace('http://', 'ws://')
    } else if (absoluteUrl.startsWith('https://')) {
      configuredWebSocketUrl = absoluteUrl.replace('https://', 'wss://')
    } else {
      configuredWebSocketUrl = absoluteUrl
    }
    console.log(`WebSocket (Global): URL has been configured to ${configuredWebSocketUrl}`)
  }
  _internalConnectAttempt() // Attempt connection using the (now possibly set) configured URL
}

const disconnect = () => {
  if (wsInstance) {
    console.log(`WebSocket (Global): Closing connection to ${configuredWebSocketUrl}.`)
    status.value = 'CLOSING'
    wsInstance.close()
    // The onclose handler will set status to 'CLOSED' and wsInstance to null
  }
}

// onScopeDispose is not used for this singleton service model.
// Connection lifetime is managed by explicit connect/disconnect calls.

export function useWebSocket() {
  // Returns access to the singleton state and control methods.
  return {
    status: readonly(status) as Readonly<Ref<WebSocketStatus>>,
    data: readonly(data) as Readonly<Ref<unknown | null>>,
    errorEvent: readonly(errorEvent) as Readonly<Ref<Event | CloseEvent | null>>,
    connect,
    disconnect,
  }
}
