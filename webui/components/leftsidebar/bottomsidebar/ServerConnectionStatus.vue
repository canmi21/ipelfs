<!-- components/leftsidebar/bottomsidebar/ServerConnectionStatus.vue -->

<template>
  <div
    class="server-status-icon-container"
    :title="`WebSocket Status: ${connectionStatus}`"
    tabindex="0"
    :class="statusClass"
    @mouseenter="handleIconMouseEnter"
    @mouseleave="handleIconMouseLeave"
    @focus="handleIconMouseEnter"
    @blur="handleIconMouseLeave"
  >
    <Server :size="24" :stroke-width="2" />
    <transition name="fade-server-info-card">
      <ServerInfoCard
        v-if="isCardVisible"
        :card-style="cardDynamicStyle"
        @mouseenter="handleCardMouseEnter"
        @mouseleave="handleCardMouseLeave"
      />
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, computed, ref, type StyleValue } from 'vue'
import { Server } from 'lucide-vue-next'
import { useWebSocket } from '../../../composables/useWebSocket'
import ServerInfoCard from './serverconnectionstatus/ServerInfoCard.vue'

export default defineComponent({
  name: 'ServerConnectionStatus',
  components: {
    Server,
    ServerInfoCard,
  },
  setup() {
    const wsUrl = 'ws://localhost:33330/v1/ipelfs/socket'
    const { status, connect } = useWebSocket(wsUrl)

    const isCardVisible = ref(false)
    const cardPosition = ref({ x: 0, y: 0 })
    let showCardTimerId: number | null = null
    let hideCardTimerId: number | null = null

    // const cardWidthRem = 9; // Card width in rem - not needed for this positioning logic
    const cardHeightRem = 15 // Card height in rem, defined in CSS

    const clearTimers = () => {
      if (showCardTimerId !== null) {
        clearTimeout(showCardTimerId)
        showCardTimerId = null
      }
      if (hideCardTimerId !== null) {
        clearTimeout(hideCardTimerId)
        hideCardTimerId = null
      }
    }

    const handleIconMouseEnter = (event: MouseEvent | FocusEvent) => {
      clearTimers()
      showCardTimerId = window.setTimeout(() => {
        if (event instanceof MouseEvent) {
          cardPosition.value = { x: event.clientX, y: event.clientY }
        } else {
          const rect = (event.currentTarget as HTMLElement)?.getBoundingClientRect()
          if (rect) {
            // For focus, position card's bottom-left relative to the icon's bottom-left
            cardPosition.value = { x: rect.left, y: rect.bottom }
          }
        }
        isCardVisible.value = true
      }, 700)
    }

    const startHideCardTimer = () => {
      clearTimers()
      hideCardTimerId = window.setTimeout(() => {
        isCardVisible.value = false
      }, 200)
    }

    const handleIconMouseLeave = () => {
      clearTimeout(showCardTimerId)
      startHideCardTimer()
    }

    const handleCardMouseEnter = () => {
      clearTimeout(hideCardTimerId)
    }

    const handleCardMouseLeave = () => {
      startHideCardTimer()
    }

    onMounted(() => {
      connect()
    })

    onUnmounted(() => {
      clearTimers()
    })

    const statusClass = computed(() => {
      return `status-${status.value.toLowerCase()}`
    })

    const cardDynamicStyle = computed((): StyleValue => {
      const fontSize =
        typeof window !== 'undefined'
          ? parseFloat(getComputedStyle(document.documentElement).fontSize)
          : 16
      const cardPixelHeight = cardHeightRem * fontSize
      // const cardPixelWidth = cardWidthRem * fontSize; // Not needed for left calculation

      return {
        position: 'fixed',
        // Position bottom-left corner of card at mouseX, mouseY
        left: `${cardPosition.value.x}px`, // Card's left edge is at mouseX
        top: `${cardPosition.value.y - cardPixelHeight}px`, // Card's top edge = mouseY - cardHeight (so bottom is at mouseY)
      }
    })

    return {
      connectionStatus: status,
      statusClass,
      isCardVisible,
      cardDynamicStyle,
      handleIconMouseEnter,
      handleIconMouseLeave,
      handleCardMouseEnter,
      handleCardMouseLeave,
    }
  },
})
</script>

<style scoped>
@import '../../../assets/app/leftsidebar/bottomsidebar/serverconnectionstatus.css';

.server-status-icon-container {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.fade-server-info-card-enter-active,
.fade-server-info-card-leave-active {
  transition:
    opacity 0.2s ease-in-out,
    transform 0.2s ease-in-out;
}
.fade-server-info-card-enter-from,
.fade-server-info-card-leave-to {
  opacity: 0;
  transform: translateY(10px) translateX(0px); /* Adjusted transform for bottom-left anchor appearance */
}
.fade-server-info-card-enter-to,
.fade-server-info-card-leave-from {
  opacity: 1;
  transform: translateY(0) translateX(0);
}
</style>
