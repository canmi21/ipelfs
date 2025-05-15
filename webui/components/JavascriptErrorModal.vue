<script setup lang="ts">
import { FileJson2, ExternalLink, RotateCcw } from 'lucide-vue-next'

const props = defineProps<{
  showOverlay: boolean
  helpLink: string
}>()

const emit = defineEmits(['refresh-page', 'open-external-link'])

const handleRefresh = () => {
  emit('refresh-page')
}
const handleOpenHelpLink = () => {
  emit('open-external-link', props.helpLink)
}
</script>

<template>
  <Transition name="overlay-fade">
    <div
      v-if="props.showOverlay"
      class="fixed inset-0 z-[9999] bg-gray-900 bg-opacity-40 dark:bg-black dark:bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <Transition name="modal-pop" appear>
        <div
          class="modal-card-content bg-modal-bg text-modal-text p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg relative"
        >
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center">
              <FileJson2 class="w-7 h-7 text-orange-500 dark:text-orange-400 mr-3 flex-shrink-0" />
              <h2 class="text-xl sm:text-2xl font-semibold text-orange-600 dark:text-orange-400">
                JavaScript Issue
              </h2>
            </div>
            <button
              @click="handleOpenHelpLink"
              class="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full transition-colors duration-150"
              title="Why is JavaScript needed?"
              aria-label="Why is JavaScript needed?"
            >
              <ExternalLink class="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          <div class="flex items-center mb-5 text-modal-text-secondary">
            <strong class="text-sm sm:text-base">The WebUI requires JavaScript to function.</strong>
          </div>
          <p class="text-sm sm:text-base text-modal-text-secondary mb-3">
            JavaScript is essential for:
          </p>
          <ul class="space-y-2 text-sm sm:text-base text-modal-text-secondary">
            <li class="flex items-start">
              <span class="mr-2 text-orange-500 dark:text-orange-400 flex-shrink-0">&rarr;</span
              >Interactive UI elements and smooth animations.
            </li>
            <li class="flex items-start">
              <span class="mr-2 text-orange-500 dark:text-orange-400 flex-shrink-0">&rarr;</span
              >Backend communication for live updates.
            </li>
            <li class="flex items-start">
              <span class="mr-2 text-orange-500 dark:text-orange-400 flex-shrink-0">&rarr;</span
              >Dynamic content rendering and interactions.
            </li>
            <li class="flex items-start">
              <span class="mr-2 text-orange-500 dark:text-orange-400 flex-shrink-0">&rarr;</span
              >Overall application logic.
            </li>
          </ul>
          <p class="text-sm sm:text-base text-modal-text-secondary mt-4">
            Please enable JavaScript in your browser settings and refresh the page.
          </p>
          <button
            @click="handleRefresh"
            class="mt-6 w-full bg-button-primary hover:bg-button-primary-hover text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-150 ease-in-out flex items-center justify-center text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-button-primary-focus"
          >
            <RotateCcw class="w-4 h-4 sm:w-5 sm:h-5 mr-2" />Refresh Page
          </button>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
/* Styles for this modal, similar to ConnectionLostModal */
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
/* Overlay and Modal transitions (assuming global or copy here) */
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
