<script setup lang="ts">
import { ref, watch, nextTick, computed, onUnmounted } from 'vue' // Added ref, watch, nextTick, onUnmounted
import { ServerOff, ExternalLink, RotateCcw, X as IconX } from 'lucide-vue-next'
import ActionSwitch from './ActionSwitch.vue'
import './../assets/connectionlost.css'

const props = defineProps<{
  isBackendConnected: boolean
  isRetryingManualCheck: boolean
  triggerShake: boolean
  showRetryFailureIcon: boolean
}>()

const emit = defineEmits(['retry-connection', 'open-issues-page'])

const modalContentRef = ref<HTMLElement | null>(null) // Ref for the modal content area

const handleRetry = () => {
  emit('retry-connection')
}
const handleOpenIssues = () => {
  emit('open-issues-page')
}

// --- Focus Trap Logic ---
const getFocusableElements = (): HTMLElement[] => {
  if (!modalContentRef.value) return []
  const selector =
    'a[href]:not([disabled]), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex=""], [tabindex="-1"])'
  const elements = Array.from(modalContentRef.value.querySelectorAll<HTMLElement>(selector))
  // Filter for visible elements
  return elements.filter((el) => {
    const style = window.getComputedStyle(el)
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      el.offsetWidth > 0 &&
      el.offsetHeight > 0
    )
  })
}

const handleFocusTrap = (event: KeyboardEvent) => {
  if (event.key !== 'Tab' || !modalContentRef.value) {
    return // Only trap Tab key, and only if modal is present
  }

  const focusableElements = getFocusableElements()
  if (focusableElements.length === 0) {
    event.preventDefault() // No focusable elements within modal, prevent tabbing out
    return
  }

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (event.shiftKey) {
    // Shift + Tab
    // If current active element is the first, or if focus is somehow outside the modal (e.g. browser URL bar then shift-tab)
    if (
      document.activeElement === firstElement ||
      !modalContentRef.value.contains(document.activeElement)
    ) {
      lastElement.focus()
      event.preventDefault()
    }
  } else {
    // Tab
    // If current active element is the last, or if focus is somehow outside the modal
    if (
      document.activeElement === lastElement ||
      !modalContentRef.value.contains(document.activeElement)
    ) {
      firstElement.focus()
      event.preventDefault()
    }
  }
}

watch(
  () => props.isBackendConnected,
  (isConnected, oldIsConnected) => {
    const isModalVisible = !isConnected
    const wasModalVisible = oldIsConnected === false // oldIsConnected would be true if it *was* connected

    if (isModalVisible && !wasModalVisible) {
      // Modal just became visible
      nextTick(() => {
        const focusableElements = getFocusableElements()
        if (focusableElements.length > 0) {
          // Try to focus the "Retry Connection" button first as it's a primary action.
          // It can be identified by a specific class or attribute if needed, or by being last.
          // For now, let's focus the last interactable element, which is the retry button.
          // Or better, find it more reliably if possible.
          const retryButton = modalContentRef.value?.querySelector<HTMLButtonElement>(
            'button.retry-button-js-hook',
          ) // Added a hook class
          if (retryButton) {
            retryButton.focus()
          } else if (focusableElements.length > 0) {
            // Fallback to the first focusable element if retry button not found by hook
            focusableElements[0].focus()
          }
        } else if (modalContentRef.value) {
          // If no interactive elements, focus the modal card itself (it needs tabindex="-1")
          // (modalContentRef.value as HTMLElement).focus();
        }
        document.addEventListener('keydown', handleFocusTrap)
      })
    } else if (!isModalVisible && wasModalVisible) {
      // Modal just became hidden
      document.removeEventListener('keydown', handleFocusTrap)
      // Optionally, restore focus to the element that had focus before modal opened
      // This requires storing that element, which is an advanced enhancement.
    }
  },
)

onUnmounted(() => {
  document.removeEventListener('keydown', handleFocusTrap)
})

// Computed state for the GitHub Issues ActionSwitch
const githubIssuesSwitchState = computed(() => ({
  iconComponent: ExternalLink,
  title: 'Open GitHub Issues',
  iconClass:
    'text-gray-400 dark:text-gray-500 group-hover:!text-gray-600 dark:group-hover:!text-gray-300',
}))

// Focus visible classes for interactable elements (ActionSwitch already has its own via props)
const focusVisibleRingBase =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500 focus-visible:ring-offset-2'
const focusVisibleRingOffsetModalBg = // For elements directly on modal background
  'focus-visible:ring-offset-[var(--modal-bg-color)] dark:focus-visible:ring-offset-[var(--modal-bg-color)]'

// Dynamic classes for the retry button
const retryButtonClasses = computed(() => {
  if (props.isRetryingManualCheck) {
    return 'connection-lost-modal-button-retrying text-gray-700 dark:text-gray-300'
  }
  if (props.showRetryFailureIcon) {
    return 'connection-lost-modal-button-failed text-white'
  }
  return 'connection-lost-modal-button-primary text-white'
})
</script>

<template>
  <Transition name="overlay-fade">
    <div
      v-if="!props.isBackendConnected"
      class="fixed inset-0 z-[9998] bg-gray-900 bg-opacity-40 dark:bg-black dark:bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="connection-lost-title"
    >
      <Transition name="modal-pop" appear>
        <div
          ref="modalContentRef"
          class="modal-card-content bg-modal-bg text-modal-text p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg relative"
          tabindex="-1"
        >
          <div class="flex justify-between items-center mb-4">
            <div class="flex items-center">
              <ServerOff class="w-8 h-8 text-red-500 dark:text-red-400 mr-3 flex-shrink-0" />
              <h2
                id="connection-lost-title"
                class="text-xl sm:text-2xl font-semibold text-red-600 dark:text-red-400"
              >
                Connection Lost
              </h2>
            </div>
            <ActionSwitch
              :icon-component="githubIssuesSwitchState.iconComponent"
              :title="githubIssuesSwitchState.title"
              :icon-class="githubIssuesSwitchState.iconClass"
              :on-toggle="handleOpenIssues"
              aria-label="Open GitHub Issues for help"
              class="connection-lost-github-button"
            />
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
            class="retry-button-js-hook mt-6 w-full font-semibold py-2.5 px-4 rounded-lg transition-all duration-150 ease-in-out flex items-center justify-center text-sm sm:text-base"
            :class="[
              retryButtonClasses,
              focusVisibleRingBase,
              focusVisibleRingOffsetModalBg,
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
/* Animations (spin, shake) and layout transitions (overlay-fade, modal-pop) remain scoped here */
.animate-spin {
  animation: spin 1s linear infinite;
}
.animate-shake {
  animation: shake-effect 0.4s ease-in-out;
}

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
