// composables/leftsidebar/bottomsidebar/useServerInfoCard.ts

import { ref, computed, onScopeDispose, readonly, type Ref, type StyleValue } from 'vue'

const SHOW_DELAY_MS = 210
const HIDE_DELAY_MS = 300

const IS_CLIENT = typeof window !== 'undefined'

export function useServerInfoCard() {
  const isCardVisible = ref(false)
  const cardPosition = ref({ x: 0, y: 0 }) // Stores mouse clientX/clientY

  let showTimeoutId: number | null = null
  let hideTimeoutId: number | null = null

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
  }

  const showCardLogic = (event: MouseEvent | FocusEvent) => {
    if (event instanceof MouseEvent) {
      cardPosition.value = { x: event.clientX, y: event.clientY }
    } else {
      // FocusEvent
      const rect = (event.currentTarget as HTMLElement)?.getBoundingClientRect()
      if (rect) {
        cardPosition.value = { x: rect.left, y: rect.bottom } // Anchor bottom-left of card to icon's bottom-left
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
      clearTimeout(showTimeoutId)
    }
    showTimeoutId = null

    if (isCardVisible.value && hideTimeoutId === null) {
      hideTimeoutId = window.setTimeout(hideCardLogic, HIDE_DELAY_MS)
    } else if (!isCardVisible.value) {
      if (hideTimeoutId !== null) {
        clearTimeout(hideTimeoutId)
      }
      hideTimeoutId = null
    }
  }

  const handleCardMouseEnter = () => {
    isMouseOverCard.value = true
    if (hideTimeoutId !== null) {
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
    // cardPosition.value.x is mouseX, cardPosition.value.y is mouseY
    // We want the card's bottom-left corner to be at (mouseX, mouseY)
    return {
      position: 'fixed',
      left: `${cardPosition.value.x}px`,
      bottom: IS_CLIENT ? `${window.innerHeight - cardPosition.value.y}px` : 'auto', // Card's bottom edge relative to viewport bottom
      // top will be auto, height will grow upwards from 'bottom'
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
