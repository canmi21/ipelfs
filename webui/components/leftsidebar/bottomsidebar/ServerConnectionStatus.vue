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
      // connectionStatus: status, // 不再需要，因为移除了 title
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
  transform: translateY(10px);
}
.fade-server-info-card-enter-to,
.fade-server-info-card-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
