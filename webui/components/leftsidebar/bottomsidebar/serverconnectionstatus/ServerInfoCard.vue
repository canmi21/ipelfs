<!-- components/leftsidebar/bottomsidebar/serverconnectionstatus/ServerInfoCard.vue -->

<template>
  <div class="server-info-card" :style="cardStyle">
    <transition name="content-switcher" mode="out-in">
      <div v-if="!showActualContent" class="loader-container" key="loader-phase">
        <transition name="fade-spinner">
          <span v-if="spinnerVisible" class="mirrored-icon-wrapper">
            <RotateCcw :size="32" :stroke-width="2" class="icon-spin-animation" />
          </span>
        </transition>
      </div>
      <div v-else class="content-container" key="text-phase">
        <p class="card-title">{{ title }}</p>
        <p class="card-description">{{ desc }}</p>
        <p class="card-status" :class="statusTextClass">
          <span class="status-indicator-wrapper">
            <span class="status-indicator-inner" :class="statusColorClass" />
            <span class="status-indicator-outer" :class="statusColorClass" />
          </span>
          {{ cardStatusText }}
        </p>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  onUnmounted,
  computed,
  type PropType,
  type StyleValue,
} from 'vue'
import { RotateCcw } from 'lucide-vue-next'
import { useI18n } from '@/composables/useI18n'
import { useWebSocket } from '@/composables/useWebSocket'

export default defineComponent({
  name: 'ServerInfoCard',
  components: {
    RotateCcw,
  },
  props: {
    cardStyle: {
      type: Object as PropType<StyleValue>,
      required: true,
    },
  },
  setup() {
    const { t, rt } = useI18n()
    const { status: wsStatus } = useWebSocket()

    const title = rt('infocard.how')
    const desc = rt('infocard.desc')

    const cardStatusText = computed(() => {
      switch (wsStatus.value) {
        case 'OPEN':
          return t('infocard.connected')
        case 'CONNECTING':
        case 'CLOSING':
          return t('infocard.connecting')
        default:
          return t('infocard.disconnect')
      }
    })

    const statusTextClass = computed(() => {
      switch (wsStatus.value) {
        case 'OPEN':
          return 'status-text-open'
        case 'CONNECTING':
        case 'CLOSING':
          return 'status-text-connecting'
        default:
          return 'status-text-disconnected'
      }
    })

    const statusColorClass = computed(() => {
      switch (wsStatus.value) {
        case 'OPEN':
          return 'status-indicator-green'
        case 'CONNECTING':
        case 'CLOSING':
          return 'status-indicator-yellow'
        default:
          return 'status-indicator-red'
      }
    })

    const showActualContent = ref(false)
    const spinnerVisible = ref(false)
    let spinnerFadeInTimerId: number | null = null
    let contentDisplayTimerId: number | null = null

    onMounted(() => {
      spinnerFadeInTimerId = window.setTimeout(() => {
        spinnerVisible.value = true
      }, 70)

      contentDisplayTimerId = window.setTimeout(() => {
        showActualContent.value = true
      }, 210)
    })

    onUnmounted(() => {
      if (spinnerFadeInTimerId !== null) clearTimeout(spinnerFadeInTimerId)
      if (contentDisplayTimerId !== null) clearTimeout(contentDisplayTimerId)
    })

    return {
      showActualContent,
      spinnerVisible,
      title,
      desc,
      cardStatusText,
      statusTextClass,
      statusColorClass,
    }
  },
})
</script>

<style scoped>
@import '../../../../assets/app/leftsidebar/bottomsidebar/serverconnectionstatus/serverinfocard.css';

.loader-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
}

.mirrored-icon-wrapper {
  display: inline-block;
  transform: scaleX(-1);
}

@keyframes server-info-card-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}

.icon-spin-animation {
  animation: server-info-card-spin 1s linear infinite;
  display: block;
}

.card-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card-description {
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  flex-grow: 1;
}

.card-status {
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: auto;
  width: 100%;
  display: flex;
  align-items: center;
}

.status-text-open {
  color: var(--theme-green-base);
}
.status-text-connecting {
  color: var(--theme-yellow-base);
}
.status-text-disconnected {
  color: var(--theme-red-base);
}

/* status indicator (inner + outer glow) */
.status-indicator-wrapper {
  position: relative;
  display: inline-block;
  width: 0.6rem;
  height: 0.6rem;
  margin-right: 0.5rem;
}

.status-indicator-inner,
.status-indicator-outer {
  position: absolute;
  border-radius: 50%;
  top: 0;
  left: 0;
}

.status-indicator-inner {
  width: 100%;
  height: 100%;
  background-color: currentColor;
  z-index: 2;
  animation: pulse-inner 2.8s ease-in-out infinite;
}

.status-indicator-outer {
  width: 100%;
  height: 100%;
  background-color: currentColor;
  opacity: 0.5;
  filter: blur(4px);
  transform: scale(1.3);
  z-index: 1;
  animation: pulse-outer 4.2s ease-in-out infinite;
}

.status-indicator-green {
  color: var(--theme-green-base);
}
.status-indicator-yellow {
  color: var(--theme-yellow-base);
}
.status-indicator-red {
  color: var(--theme-red-base);
}

@keyframes pulse-inner {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes pulse-outer {
  0%,
  100% {
    transform: scale(1.3);
    opacity: 0.45;
  }
  50% {
    transform: scale(1.4);
    opacity: 0.6;
  }
}

.fade-spinner-enter-active {
  transition: opacity 0.15s ease-in;
}
.fade-spinner-enter-from {
  opacity: 0;
}
.fade-spinner-enter-to {
  opacity: 1;
}

.content-switcher-enter-active {
  transition: opacity 0.2s ease-in 0.05s;
}
.content-switcher-leave-active {
  transition: opacity 0.2s ease-out;
}
.content-switcher-enter-from,
.content-switcher-leave-to {
  opacity: 0;
}
.content-switcher-enter-to,
.content-switcher-leave-from {
  opacity: 1;
}
</style>
