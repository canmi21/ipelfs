// composables/leftsidebar/bottomsidebar/useServerInfoCard.ts

import { ref, computed, onScopeDispose, readonly, type Ref, type StyleValue } from 'vue'

const CARD_HEIGHT_REM = 9
const SHOW_DELAY_MS = 700
const HIDE_DELAY_MS = 300

const IS_CLIENT = typeof window !== 'undefined'

export function useServerInfoCard() {
  const isCardVisible = ref(false)
  const cardPosition = ref({ x: 0, y: 0 })

  let showTimeoutId: number | null = null
  let hideTimeoutId: number | null = null

  const isMouseOverIcon = ref(false)
  const isMouseOverCard = ref(false)

  const clearTimers = () => {
    if (showTimeoutId !== null) {
      clearTimeout(showTimeoutId)
    }
    showTimeoutId = null
    if (hideTimeoutId !== null) {
      clearTimeout(hideTimeoutId)
    }
    hideTimeoutId = null
  }

  const showCardLogic = (event: MouseEvent | FocusEvent) => {
    if (event instanceof MouseEvent) {
      cardPosition.value = { x: event.clientX, y: event.clientY }
    } else {
      // FocusEvent
      const rect = (event.currentTarget as HTMLElement)?.getBoundingClientRect()
      if (rect) {
        cardPosition.value = { x: rect.left, y: rect.bottom }
      }
    }
    isCardVisible.value = true
  }

  const hideCardLogic = () => {
    if (!isMouseOverIcon.value && !isMouseOverCard.value) {
      isCardVisible.value = false
    }
  }

  const handleIconMouseEnter = (event: MouseEvent | FocusEvent) => {
    isMouseOverIcon.value = true
    if (hideTimeoutId !== null) {
      // Guard direct call
      clearTimeout(hideTimeoutId)
    }
    hideTimeoutId = null

    if (!isCardVisible.value && showTimeoutId === null) {
      showTimeoutId = window.setTimeout(() => {
        if (isMouseOverIcon.value) {
          showCardLogic(event)
        }
        showTimeoutId = null
      }, SHOW_DELAY_MS)
    }
  }

  const handleIconMouseLeave = () => {
    isMouseOverIcon.value = false
    if (showTimeoutId !== null) {
      // Guard direct call
      clearTimeout(showTimeoutId)
    }
    showTimeoutId = null

    if (isCardVisible.value && hideTimeoutId === null) {
      hideTimeoutId = window.setTimeout(hideCardLogic, HIDE_DELAY_MS)
    } else if (!isCardVisible.value) {
      // If card is not visible, ensure any stray hide timer is cleared.
      if (hideTimeoutId !== null) {
        // Guard direct call
        clearTimeout(hideTimeoutId)
      }
      hideTimeoutId = null
    }
  }

  const handleCardMouseEnter = () => {
    isMouseOverCard.value = true
    if (hideTimeoutId !== null) {
      // Guard direct call - this was the line you highlighted
      clearTimeout(hideTimeoutId)
    }
    hideTimeoutId = null
  }

  const handleCardMouseLeave = () => {
    isMouseOverCard.value = false
    if (isCardVisible.value && hideTimeoutId === null) {
      hideTimeoutId = window.setTimeout(hideCardLogic, HIDE_DELAY_MS)
    }
  }

  const cardDynamicStyle = computed((): StyleValue => {
    const fontSize = IS_CLIENT
      ? parseFloat(getComputedStyle(document.documentElement).fontSize)
      : 16
    const cardPixelHeight = CARD_HEIGHT_REM * fontSize

    return {
      position: 'fixed',
      left: `${cardPosition.value.x}px`,
      top: `${cardPosition.value.y - cardPixelHeight}px`,
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
