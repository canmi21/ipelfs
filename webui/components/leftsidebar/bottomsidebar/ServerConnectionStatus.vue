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
    const wsRelativeEndpoint = '/v1/ipelfs/socket' // Define the relative endpoint
    const { status, connect } = useWebSocket() // Get the singleton methods and status

    const {
      isCardVisible,
      cardDynamicStyle,
      handleIconMouseEnter,
      handleIconMouseLeave,
      handleCardMouseEnter,
      handleCardMouseLeave,
    } = useServerInfoCard()

    onMounted(() => {
      connect(wsRelativeEndpoint) // Call connect once with the endpoint to configure and initiate
    })

    const statusClass = computed(() => {
      return `status-${status.value.toLowerCase()}`
    })

    return {
      connectionStatus: status, // For potential use, e.g. debugging or more detailed title
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
}
.server-info-card-transition-enter-from {
  opacity: 0;
  width: 0px;
  height: 0px;
}
.server-info-card-transition-enter-to {
  opacity: 1;
  width: 19rem;
  height: 9rem;
}

/* Card Disappearance (Leave) Transition: Fade out at full size with optional transform */
.server-info-card-transition-leave-active {
  transition:
    opacity 0.2s ease-in-out,
    transform 0.2s ease-in-out;
}
.server-info-card-transition-leave-from {
  opacity: 1;
  width: 19rem;
  height: 9rem;
  transform: translateY(0px);
}
.server-info-card-transition-leave-to {
  opacity: 0;
  width: 19rem;
  height: 9rem;
  transform: translateY(10px);
}
</style>
