<!-- components/leftsidebar/bottomsidebar/ServerConnectionStatus.vue -->

<template>
  <div
    class="server-status-icon-container"
    tabindex="0"
    :class="statusClass"
    @mouseenter="handleIconMouseEnter"
    @mouseleave="handleIconMouseLeave"
    @focus="handleIconMouseEnter"
    @blur="handleIconMouseLeave"
  >
    <Server :size="24" :stroke-width="2" />
    <transition name="server-info-card-transition">
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
import { defineComponent, onMounted, computed } from 'vue'
import { Server } from 'lucide-vue-next'
import { useWebSocket } from '../../../composables/useWebSocket'
import ServerInfoCard from './serverconnectionstatus/ServerInfoCard.vue'
import { useServerInfoCard } from '../../../composables/leftsidebar/bottomsidebar/useServerInfoCard'

export default defineComponent({
  name: 'ServerConnectionStatus',
  components: {
    Server,
    ServerInfoCard,
  },
  setup() {
    const wsUrl = 'ws://localhost:33330/v1/ipelfs/socket'
    const { status, connect } = useWebSocket(wsUrl)

    const {
      isCardVisible,
      cardDynamicStyle,
      handleIconMouseEnter,
      handleIconMouseLeave,
      handleCardMouseEnter,
      handleCardMouseLeave,
    } = useServerInfoCard()

    onMounted(() => {
      connect()
    })

    const statusClass = computed(() => {
      return `status-${status.value.toLowerCase()}`
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

/* Card Appearance (Enter) Transition: Growth from bottom-left */
.server-info-card-transition-enter-active {
  transition:
    opacity 0.21s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.21s cubic-bezier(0.4, 0, 0.2, 1),
    height 0.21s cubic-bezier(0.4, 0, 0.2, 1);
  /* transform-origin: bottom left; /* Not strictly needed when animating width/height from anchored L/B */
}
.server-info-card-transition-enter-from {
  opacity: 0;
  width: 0px; /* Start from 0 width */
  height: 0px; /* Start from 0 height */
  /* left and bottom are set by :card-style, growth is up and right */
}
.server-info-card-transition-enter-to {
  opacity: 1;
  width: 15rem; /* Final width from serverinfocard.css */
  height: 9rem; /* Final height from serverinfocard.css */
}

/* Card Disappearance (Leave) Transition: Fade out at full size with optional transform */
.server-info-card-transition-leave-active {
  transition:
    opacity 0.2s ease-in-out,
    transform 0.2s ease-in-out; /* For the slight translateY on leave */
  /* Width and height are NOT transitioned on leave */
}
.server-info-card-transition-leave-from {
  opacity: 1;
  width: 15rem; /* Maintain full size */
  height: 9rem; /* Maintain full size */
  transform: translateY(0px);
}
.server-info-card-transition-leave-to {
  opacity: 0;
  width: 15rem; /* Maintain full size while fading */
  height: 9rem; /* Maintain full size while fading */
  transform: translateY(10px); /* Slight downward movement on fade out */
}
</style>
