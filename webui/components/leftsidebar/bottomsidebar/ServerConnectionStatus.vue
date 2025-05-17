<!-- components/leftsidebar/bottomsidebar/ServerConnectionStatus.vue -->

<template>
  <div class="server-status-icon-container" tabindex="0">
    <Server :size="24" :stroke-width="2" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Server } from 'lucide-vue-next'

export default defineComponent({
  name: 'ServerConnectionStatus',
  components: {
    Server,
  },
})
</script>

<style scoped>
@import '../../../assets/app/leftsidebar/bottomsidebar/serverconnectionstatus.css';

.server-status-icon-container {
  width: 1.5rem; /* To contain 1.5rem icon */
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
