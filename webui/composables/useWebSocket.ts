// composables/useWebSocket.ts

import { ref, readonly, shallowRef, onScopeDispose, type Ref } from 'vue'

export type WebSocketStatus = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' | 'ERROR' | 'INITIAL'

const IS_CLIENT = typeof window !== 'undefined'

export function useWebSocket(url: string) {
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

    console.log(`Attempting to connect to WebSocket: ${url}`)
    status.value = 'CONNECTING'
    data.value = null
    errorEvent.value = null

    try {
      let correctedUrl = url
      if (url.startsWith('http://')) {
        correctedUrl = url.replace('http://', 'ws://')
      } else if (url.startsWith('https://')) {
        correctedUrl = url.replace('https://', 'wss://')
      }
      console.log(`Corrected WebSocket URL: ${correctedUrl}`)

      ws = new WebSocket(correctedUrl)

      ws.onopen = () => {
        status.value = 'OPEN'
        console.log(`WebSocket connected: ${correctedUrl}`)
      }

      ws.onmessage = (event) => {
        console.log('WebSocket message received:', event.data)
        data.value = event.data // Or JSON.parse(event.data) if expecting JSON
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
          `WebSocket disconnected: ${correctedUrl}`,
          `Code: ${event.code}, Reason: "${event.reason}", Clean: ${event.wasClean}`,
        )
        ws = null
      }
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err)
      status.value = 'ERROR'
      // errorEvent.value = err as Event; // 'err' might not be an Event instance
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
