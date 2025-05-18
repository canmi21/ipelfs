// composables/useWebSocket.ts

import { ref, readonly, shallowRef, onScopeDispose, type Ref } from 'vue'
import { getAbsoluteApiUrl } from './useApiUrl'

export type WebSocketStatus = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' | 'ERROR' | 'INITIAL'

const IS_CLIENT = typeof window !== 'undefined'

export function useWebSocket(relativeEndpoint: string) {
  const status = ref<WebSocketStatus>('INITIAL')
  const data = shallowRef<unknown | null>(null)
  const errorEvent = shallowRef<Event | CloseEvent | null>(null)
  let ws: WebSocket | null = null

  const connect = () => {
    if (!IS_CLIENT) {
      console.log('WebSocket connection attempt skipped (not in client environment).')
      return
    }
    if (ws && (status.value === 'OPEN' || status.value === 'CONNECTING')) {
      console.log('WebSocket already open or connecting.')
      return
    }

    const absoluteUrl = getAbsoluteApiUrl(relativeEndpoint)
    console.log(`Attempting to connect to WebSocket using base: ${absoluteUrl}`)
    status.value = 'CONNECTING'
    data.value = null
    errorEvent.value = null

    try {
      let correctedWebSocketUrl = absoluteUrl
      if (absoluteUrl.startsWith('http://')) {
        correctedWebSocketUrl = absoluteUrl.replace('http://', 'ws://')
      } else if (absoluteUrl.startsWith('https://')) {
        correctedWebSocketUrl = absoluteUrl.replace('https://', 'wss://')
      }
      console.log(`Corrected WebSocket URL for connection: ${correctedWebSocketUrl}`)

      ws = new WebSocket(correctedWebSocketUrl)

      ws.onopen = () => {
        status.value = 'OPEN'
        console.log(`WebSocket connected: ${correctedWebSocketUrl}`)
      }

      ws.onmessage = (event) => {
        console.log('WebSocket message received:', event.data)
        data.value = event.data
      }

      ws.onerror = (event) => {
        status.value = 'ERROR'
        errorEvent.value = event
        console.error('WebSocket error:', event)
      }

      ws.onclose = (event: CloseEvent) => {
        status.value = 'CLOSED'
        errorEvent.value = event
        console.log(
          `WebSocket disconnected: ${correctedWebSocketUrl}`,
          `Code: ${event.code}, Reason: "${event.reason}", Clean: ${event.wasClean}`,
        )
        ws = null
      }
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err)
      status.value = 'ERROR'
    }
  }

  const disconnect = () => {
    if (ws) {
      console.log('Closing WebSocket connection.')
      status.value = 'CLOSING'
      ws.close()
    }
  }

  if (IS_CLIENT) {
    try {
      onScopeDispose(() => {
        disconnect()
      })
    } catch {
      console.warn(
        'useWebSocket: onScopeDispose not available. Manual disconnect might be needed if used outside setup().',
      )
    }
  }

  return {
    status: readonly(status) as Readonly<Ref<WebSocketStatus>>,
    data: readonly(data) as Readonly<Ref<unknown | null>>,
    errorEvent: readonly(errorEvent) as Readonly<Ref<Event | CloseEvent | null>>,
    connect,
    disconnect,
  }
}
