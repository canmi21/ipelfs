<!-- components/leftsidebar/bottomsidebar/ServerConnectionStatus.vue -->

<template>
  <div
    class="server-status-icon-container"
    :title="`WebSocket Status: ${connectionStatus}`"
    tabindex="0"
    :class="statusClass"
  >
    <Server :size="24" :stroke-width="2" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed } from 'vue'
import { Server } from 'lucide-vue-next'
import { useWebSocket } from '../../../composables/useWebSocket' // Adjust path as per your structure

export default defineComponent({
  name: 'ServerConnectionStatus',
  components: {
    Server,
  },
  setup() {
    const wsUrl = 'ws://localhost:33330/v1/ipelfs/socket' // Corrected to ws://
    const { status, connect } = useWebSocket(wsUrl)

    onMounted(() => {
      // console.log('ServerConnectionStatus: Component mounted, attempting to connect WebSocket.');
      connect()
    })

    // onUnmounted is handled by onScopeDispose within useWebSocket if called in setup context
    // If useWebSocket was designed to require manual cleanup via its returned disconnect:
    // onUnmounted(() => {
    //   console.log('ServerConnectionStatus: Component unmounted, disconnecting WebSocket.');
    //   disconnect();
    // });

    const statusClass = computed(() => {
      // Returns a class based on status, e.g., 'status-open', 'status-closed'
      // You can then style these classes in serverconnectionstatus.css to change icon color
      return `status-${status.value.toLowerCase()}`
    })

    return {
      connectionStatus: status, // Expose reactive status to the template
      statusClass,
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
}
</style>
