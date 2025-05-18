<!-- components/leftsidebar/bottomsidebar/serverconnectionstatus/ServerInfoCard.vue -->

<template>
  <div class="server-info-card" :style="cardStyle">
    <transition name="fade-loader" mode="out-in">
      <div v-if="isLoading" class="loader-container" key="loader">
        <span class="mirrored-icon-wrapper">
          <RotateCcw :size="32" :stroke-width="2" class="icon-spin-animation" />
        </span>
      </div>
      <div v-else class="content-container" key="content">Placeholder text</div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, type PropType, type StyleValue } from 'vue'
import { RotateCcw } from 'lucide-vue-next'

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
    const isLoading = ref(true)
    let loadingTimerId: number | null = null

    onMounted(() => {
      loadingTimerId = window.setTimeout(() => {
        isLoading.value = false
      }, 3000) // Display loader for 3 seconds
    })

    onUnmounted(() => {
      if (loadingTimerId !== null) {
        clearTimeout(loadingTimerId)
      }
    })

    return {
      isLoading,
    }
  },
})
</script>

<style scoped>
@import '../../../../assets/app/leftsidebar/bottomsidebar/serverconnectionstatus/serverinfocard.css';

.loader-container {
  /* For centering the loader icon */
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-container {
  /* For top-left aligned content */
  width: 100%;
  height: 100%;
  /* Default block display and text-align: left (or inherited) will position text at top-left
     within the card's padding box defined by serverinfocard.css */
  text-align: left; /* Explicitly align text to the left */
  /* align-items: flex-start; /* If it were flex, to align items at the start vertically */
  /* justify-content: flex-start; /* If it were flex, to align items at the start horizontally */
  /* For simple text, text-align: left is enough. Padding is on .server-info-card */
}

.mirrored-icon-wrapper {
  display: inline-block; /* Allows transform to apply correctly */
  transform: scaleX(-1); /* Mirrors the icon horizontally */
}

@keyframes server-info-card-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.icon-spin-animation {
  /* Renamed class for clarity, applies only spin */
  animation: server-info-card-spin 1s linear infinite;
  display: block; /* Helps some SVG elements behave consistently */
}

/* Transition for loader fading out and content fading in */
.fade-loader-enter-active {
  transition: opacity 0.2s ease-in;
}
.fade-loader-leave-active {
  transition: opacity 0.2s ease-out;
}

.fade-loader-enter-from,
.fade-loader-leave-to {
  opacity: 0;
}

.fade-loader-enter-to,
.fade-loader-leave-from {
  opacity: 1;
}
</style>
