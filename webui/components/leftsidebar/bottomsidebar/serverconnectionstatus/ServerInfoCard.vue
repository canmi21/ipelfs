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
      <div v-else class="content-container" key="text-phase">Placeholder text</div>
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
    const showActualContent = ref(false) // Controls switch from loader to actual content
    const spinnerVisible = ref(false) // Controls spinner's own fade-in

    let spinnerFadeInTimerId: number | null = null
    let contentDisplayTimerId: number | null = null

    onMounted(() => {
      // Card growth animation (210ms) is handled by the parent component's transition.
      // After a short delay (approximating card height reaching ~3rem), fade in spinner.
      // Card width/height animation is 0.21s. 3rem is 1/3 of 9rem height. So ~70ms.
      spinnerFadeInTimerId = window.setTimeout(() => {
        spinnerVisible.value = true // Trigger spinner fade-in
      }, 70) // Delay for spinner to appear after card starts growing

      // Timer to switch from spinner to actual content.
      // This 3-second timer starts after the spinner has had a chance to appear.
      contentDisplayTimerId = window.setTimeout(() => {
        showActualContent.value = true // Trigger fade-out of loader, fade-in of content
      }, 70 + 3000) // 70ms for spinner to appear + 3000ms display time
    })

    onUnmounted(() => {
      if (spinnerFadeInTimerId !== null) clearTimeout(spinnerFadeInTimerId)
      if (contentDisplayTimerId !== null) clearTimeout(contentDisplayTimerId)
    })

    return {
      showActualContent,
      spinnerVisible,
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
  text-align: center;
}

.content-container {
  width: 100%;
  height: 100%;
  display: block;
  text-align: left;
}

.mirrored-icon-wrapper {
  display: inline-block;
  transform: scaleX(-1);
}

@keyframes server-info-card-spin {
  from {
    transform: rotate(0deg); /* Ensures clockwise spin for a standard SVG */
  }
  to {
    transform: rotate(-360deg);
  }
}

.icon-spin-animation {
  animation: server-info-card-spin 1s linear infinite;
  display: block;
  transform-origin: center center;
}

/* Transition for the spinner icon itself appearing */
.fade-spinner-enter-active {
  transition: opacity 0.15s ease-in;
}
.fade-spinner-enter-from {
  opacity: 0;
}
.fade-spinner-enter-to {
  opacity: 1;
}
/* No leave for spinner, its parent div (.loader-container) will be transitioned out */

/* Transition between loader DIV and content DIV */
.content-switcher-enter-active {
  /* For content ("Placeholder text") fading in */
  transition: opacity 0.2s ease-in 0.05s; /* Small delay after loader starts fading out */
}
.content-switcher-leave-active {
  /* For loader-container fading out */
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
