// composables/leftsidebar/bottomsidebar/useServerInfoCard.ts

import { ref, computed, onScopeDispose, readonly, type Ref, type StyleValue } from 'vue'

const SHOW_DELAY_MS = 210
const HIDE_DELAY_MS = 300
const MOUSE_MONITOR_INTERVAL = 100

const IS_CLIENT = typeof window !== 'undefined'

export function useServerInfoCard() {
  const isCardVisible = ref(false)
  const cardPosition = ref({ x: 0, y: 0 })

  let showTimeoutId: number | null = null
  let hideTimeoutId: number | null = null
  let mouseMonitorIntervalId: number | null = null

  const isMouseOverIcon = ref(false)
  const isMouseOverCard = ref(false)

  const clearTimers = () => {
    if (showTimeoutId !== null) {
      clearTimeout(showTimeoutId)
      showTimeoutId = null
    }
    if (hideTimeoutId !== null) {
      clearTimeout(hideTimeoutId)
      hideTimeoutId = null
    }
    if (mouseMonitorIntervalId !== null) {
      clearInterval(mouseMonitorIntervalId)
      mouseMonitorIntervalId = null
    }
  }

  const showCardLogic = (event?: MouseEvent | FocusEvent) => {
    // 再次检查鼠标是否仍在 icon 上
    if (!isMouseOverIcon.value) return

    // 使用 window.event 获取最新位置，避免坐标滞后
    const latestEvent = window.event
    let x = 0,
      y = 0

    if (latestEvent instanceof MouseEvent) {
      x = latestEvent.clientX
      y = latestEvent.clientY
    } else if (event instanceof MouseEvent) {
      x = event.clientX
      y = event.clientY
    } else if (event instanceof FocusEvent) {
      const rect = (event.currentTarget as HTMLElement)?.getBoundingClientRect()
      if (rect) {
        x = rect.left
        y = rect.bottom
      }
    }

    cardPosition.value = { x, y }
    isCardVisible.value = true

    if (mouseMonitorIntervalId === null) {
      mouseMonitorIntervalId = window.setInterval(() => {
        const el = document.elementFromPoint(cardPosition.value.x, cardPosition.value.y)
        if (
          el &&
          !el.closest('.server-status-icon-container') &&
          !el.closest('.server-info-card')
        ) {
          isMouseOverIcon.value = false
          isMouseOverCard.value = false
          hideCardLogic()
        }
      }, MOUSE_MONITOR_INTERVAL)
    }
  }

  const hideCardLogic = () => {
    if (!isMouseOverIcon.value && !isMouseOverCard.value) {
      isCardVisible.value = false
      clearTimers()
    }
  }

  const handleIconMouseEnter = (event: MouseEvent | FocusEvent) => {
    isMouseOverIcon.value = true
    if (hideTimeoutId !== null) clearTimeout(hideTimeoutId)
    hideTimeoutId = null

    if (!isCardVisible.value && showTimeoutId === null) {
      showTimeoutId = window.setTimeout(() => {
        showCardLogic(event) // showCardLogic 会自行判断 isMouseOverIcon
        showTimeoutId = null
      }, SHOW_DELAY_MS)
    }
  }

  const handleIconMouseLeave = () => {
    isMouseOverIcon.value = false
    if (showTimeoutId !== null) clearTimeout(showTimeoutId)
    showTimeoutId = null

    if (isCardVisible.value && hideTimeoutId === null) {
      hideTimeoutId = window.setTimeout(hideCardLogic, HIDE_DELAY_MS)
    }
  }

  const handleCardMouseEnter = () => {
    isMouseOverCard.value = true
    if (hideTimeoutId !== null) clearTimeout(hideTimeoutId)
    hideTimeoutId = null
  }

  const handleCardMouseLeave = () => {
    isMouseOverCard.value = false
    if (isCardVisible.value && hideTimeoutId === null) {
      hideTimeoutId = window.setTimeout(hideCardLogic, HIDE_DELAY_MS)
    }
  }

  const cardDynamicStyle = computed((): StyleValue => {
    return {
      position: 'fixed',
      left: `${cardPosition.value.x}px`,
      bottom: IS_CLIENT ? `${window.innerHeight - cardPosition.value.y}px` : 'auto',
    }
  })

  onScopeDispose(() => {
    clearTimers()
  })

  return {
    isCardVisible: readonly(isCardVisible) as Readonly<Ref<boolean>>,
    cardDynamicStyle,
    handleIconMouseEnter,
    handleIconMouseLeave,
    handleCardMouseEnter,
    handleCardMouseLeave,
  }
}
