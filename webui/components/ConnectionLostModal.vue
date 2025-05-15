<script setup lang="ts">
import { ServerOff, ExternalLink, RotateCcw, X as IconX } from 'lucide-vue-next'

const props = defineProps<{
  isBackendConnected: boolean
  isRetryingManualCheck: boolean
  triggerShake: boolean
  showRetryFailureIcon: boolean
}>()

const emit = defineEmits(['retry-connection', 'open-issues-page'])

const handleRetry = () => {
  emit('retry-connection')
}
const handleOpenIssues = () => {
  emit('open-issues-page')
}
</script>

<template>
  <Transition name="overlay-fade">
    <div
      v-if="!props.isBackendConnected"
      class="fixed inset-0 z-[9998] bg-gray-900 bg-opacity-40 dark:bg-black dark:bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <Transition name="modal-pop" appear>
        <div
          class="modal-card-content bg-modal-bg text-modal-text p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg relative"
        >
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center">
              <ServerOff class="w-8 h-8 text-red-500 dark:text-red-400 mr-3 flex-shrink-0" />
              <h2 class="text-xl sm:text-2xl font-semibold text-red-600 dark:text-red-400">
                Connection Lost
              </h2>
            </div>
            <button
              @click="handleOpenIssues"
              class="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full transition-colors duration-150"
              title="Open GitHub Issues"
              aria-label="Open GitHub Issues for help"
            >
              <ExternalLink class="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          <div class="flex items-center mb-5 text-modal-text-secondary">
            <strong class="text-sm sm:text-base">WebUI is currently unavailable.</strong>
          </div>
          <ul class="space-y-2.5 text-sm sm:text-base text-modal-text-secondary">
            <li class="flex items-baseline">
              <span class="mr-2 text-red-500 dark:text-red-400 flex-shrink-0">&rarr;</span>
              <span>Ensure the <strong>ipelfs service</strong> is <strong>running</strong>.</span>
            </li>
            <li class="flex items-baseline">
              <span class="mr-2 text-red-500 dark:text-red-400 flex-shrink-0">&rarr;</span>
              <span
                >Verify <strong>device and server</strong> are on the
                <strong>same network</strong>.</span
              >
            </li>
            <li class="flex items-baseline">
              <span class="mr-2 text-red-500 dark:text-red-400 flex-shrink-0">&rarr;</span>
              <span>Check <strong>firewall settings</strong> for <strong>port 33330</strong>.</span>
            </li>
            <li class="flex items-baseline">
              <span class="mr-2 text-red-500 dark:text-red-400 flex-shrink-0">&rarr;</span>
              <span
                >Confirm <strong>backend URL</strong> (e.g.,
                <strong>http://localhost:33330</strong>).</span
              >
            </li>
            <li class="flex items-baseline">
              <span class="mr-2 text-red-500 dark:text-red-400 flex-shrink-0">&rarr;</span>
              <span
                >Inspect <strong>developer console</strong> and <strong>backend logs</strong>.</span
              >
            </li>
          </ul>
          <button
            @click="handleRetry"
            :disabled="props.isRetryingManualCheck || props.showRetryFailureIcon"
            class="mt-6 w-full font-semibold py-2.5 px-4 rounded-lg transition-all duration-150 ease-in-out flex items-center justify-center text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            :class="[
              props.isRetryingManualCheck
                ? 'bg-gray-400 dark:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                : props.showRetryFailureIcon
                  ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white focus:ring-red-500'
                  : 'bg-button-primary hover:bg-button-primary-hover text-white focus:ring-button-primary-focus',
              { 'animate-shake': props.triggerShake },
            ]"
          >
            <template v-if="props.showRetryFailureIcon">
              <IconX class="w-5 h-5 mr-0 sm:mr-2" />
              <span class="hidden sm:inline">Failed to Connect</span>
            </template>
            <template v-else>
              <RotateCcw
                class="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                :class="{ 'animate-spin': props.isRetryingManualCheck }"
              />
              <span>{{ props.isRetryingManualCheck ? 'Retrying...' : 'Retry Connection' }}</span>
            </template>
          </button>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
/* Styles for modal content, transitions, buttons etc. should be here or in main.css if global */
.bg-modal-bg {
  background-color: var(--modal-bg-color);
}
.text-modal-text {
  color: var(--modal-text-color);
}
.text-modal-text-secondary {
  color: var(--modal-text-secondary-color);
}

.bg-button-primary {
  background-color: var(--button-primary-bg);
}
.hover\:bg-button-primary-hover:hover {
  background-color: var(--button-primary-hover-bg);
}
.focus\:ring-button-primary-focus:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 3px var(--button-primary-focus-ring);
}

/* Animations (spin, shake, fade, pop) should ideally be global in main.css if used by multiple components */
.animate-spin {
  animation: spin 1s linear infinite;
}
.animate-shake {
  animation: shake-effect 0.4s ease-in-out;
}

/* Keyframes for spin and shake, and transitions like overlay-fade, modal-pop
   should be moved to a global CSS file (e.g., assets/main.css) if they are generic enough.
   For brevity, I'm assuming they might be in main.css. If not, copy them here or to main.css.
*/
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes shake-effect {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-2px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(2px);
  }
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
.overlay-fade-enter-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.overlay-fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.modal-pop-enter-from,
.modal-pop-leave-to {
  opacity: 0;
  transform: scale(0.92) translateY(12px);
}
.modal-pop-enter-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-pop-leave-active {
  transition: all 0.2s cubic-bezier(0.55, 0.055, 0.675, 0.19);
}
.modal-pop-enter-to,
.modal-pop-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}
</style>
