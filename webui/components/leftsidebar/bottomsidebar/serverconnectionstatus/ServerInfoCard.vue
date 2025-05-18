<!-- components/leftsidebar/bottomsidebar/serverconnectionstatus/ServerInfoCard.vue -->

<template>
  <div class="server-info-card" :style="cardStyle">123</div>
</template>

<script lang="ts">
import { defineComponent, type PropType, type StyleValue } from 'vue'

export default defineComponent({
  name: 'ServerInfoCard',
  props: {
    cardStyle: {
      type: Object as PropType<StyleValue>,
      required: true,
    },
  },
})
</script>

<style scoped>
@import '../../../../assets/app/leftsidebar/bottomsidebar/serverconnectionstatus/serverinfocard.css';

/* Scoped styles specific to ServerInfoCard if any, beyond the imported ones */
</style>
