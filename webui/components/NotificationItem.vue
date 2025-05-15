<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Notification } from './../composables/useNotifications'
import { useNotifications } from './../composables/useNotifications'
import { X as IconX } from 'lucide-vue-next'

const props = defineProps<{
  notification: Notification
}>()

const emit = defineEmits(['dismiss'])
const { pauseNotification, resumeNotification } = useNotifications()

const isHovered = ref(false)
const progressBarKey = ref(0) // Used to re-trigger CSS animation

// --- Themeing ---
const notificationThemeClasses = computed(() => {
  const baseClasses = 'border-l-4'
  // Using explicit hex codes for border colors as requested
  // Backgrounds are Tailwind's light shades
  switch (props.notification.type) {
    case 'success': // Green, using #1c9376
      return `${baseClasses} bg-green-50 dark:bg-green-800 border-[#1c9376] dark:border-[#1c9376]`
    case 'warning': // Yellow
      return `${baseClasses} bg-yellow-50 dark:bg-yellow-800 border-yellow-500 dark:border-yellow-600` // Assuming default yellow is fine
    case 'error': // Red, using #ef4444
      return `${baseClasses} bg-red-50 dark:bg-red-800 border-[#ef4444] dark:border-[#ef4444]`
    case 'info': // Info also defaults to green #1c9376
    default:
      return `${baseClasses} bg-green-50 dark:bg-green-800 border-[#1c9376] dark:border-[#1c9376]`
  }
})

const progressBarColorClass = computed(() => {
  // Slightly darker/more opaque version of the border color for progress bar
  switch (props.notification.type) {
    case 'success':
      return 'bg-[#1c9376]/70 dark:bg-[#1c9376]/60'
    case 'warning':
      return 'bg-yellow-500/70 dark:bg-yellow-600/60'
    case 'error':
      return 'bg-[#ef4444]/70 dark:bg-[#ef4444]/60'
    case 'info':
    default:
      return 'bg-[#1c9376]/70 dark:bg-[#1c9376]/60'
  }
})

// --- Event Handlers ---
const handleDismiss = () => {
  emit('dismiss', props.notification.id)
}

const handleMouseEnter = () => {
  isHovered.value = true
  pauseNotification(props.notification.id)
}

const handleMouseLeave = () => {
  isHovered.value = false
  resumeNotification(props.notification.id)
}

// --- Progress Bar Animation Control ---
// Watch for pause state changes to control CSS animation play state
const progressBarStyle = computed(() => ({
  animationDuration: `${props.notification.duration}ms`,
  animationPlayState: props.notification.isPaused ? 'paused' : 'running',
}))

// When a notification is resumed, its remainingDuration changes.
// To "restart" CSS animation from a new point with potentially new duration is tricky.
// The current setup in useNotifications.ts restarts the setTimeout with remainingDuration.
// The CSS animation will run for its original 'duration'.
// For a visually accurate CSS progress bar that resumes, we would typically
// set the animation-duration to remainingDuration AND use a negative animation-delay
// to fast-forward it. Or, simply re-key the progress bar element to force a re-render
// and restart of its animation.
// Let's use the re-keying approach for simplicity if animation needs to visually "jump" on resume.
// However, merely pausing and resuming the play state of an animation set to the *original* duration
// is the simplest to implement with CSS. The timer in useNotifications will handle actual dismissal.
// The visual bar will pause and resume its depletion over the *original* duration.

watch(
  () => props.notification.isPaused,
  (paused) => {
    // This watcher is mainly for if we need to do more complex sync with the progress bar.
    // For now, `progressBarStyle.animationPlayState` handles it.
    // If we were to adjust animation duration on resume, we'd do it here by changing a key.
    if (!paused) {
      // Potentially re-key to restart animation if remainingDuration significantly changed how it should look
      // For now, just letting animationPlayState handle it.
      // progressBarKey.value++; // This would force re-render and restart animation
    }
  },
)
</script>

<template>
  <div
    class="notification-item w-full max-w-sm rounded-md shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden relative"
    :class="[notificationThemeClasses]"
    role="alert"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="p-3">
      <div class="flex items-center">
        <div class="w-0 flex-1">
          <p
            class="text-xs font-medium text-notification-text dark:text-notification-dark-text-strong"
          >
            {{ notification.message }}
          </p>
        </div>
        <div class="ml-2 flex-shrink-0 w-5 h-5 flex items-center justify-center">
          <button
            @click="handleDismiss"
            type="button"
            class="inline-flex items-center justify-center rounded-md text-notification-text-muted dark:text-notification-dark-text-muted hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-gray-400 dark:focus:ring-gray-500 transition-opacity duration-150"
            :class="isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'"
            aria-label="Close"
          >
            <IconX class="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
    <div
      :key="progressBarKey"
      class="progress-bar absolute bottom-0 left-0 h-1"
      :class="[progressBarColorClass]"
      :style="progressBarStyle"
    ></div>
  </div>
</template>

<style scoped>
.notification-item {
  /* For dark mode text, ensure sufficient contrast. gray-100 is generally good. */
  --text-notification-text: #1f2937; /* gray-800 */
  /* Changed dark text to be whiter for better visibility as per user feedback */
  --text-notification-dark-text-strong: #ffffff; /* white */
  --text-notification-text-muted: #6b7280; /* gray-500 */
  --text-notification-dark-text-muted: #cbd5e1; /* slate-300, lighter than gray-400 for better hover on dark */
}

.text-notification-text {
  color: var(--text-notification-text);
}
/* Applied a different class for potentially stronger dark mode text */
.dark .text-notification-dark-text-strong {
  color: var(--text-notification-dark-text-strong);
}

.text-notification-text-muted {
  color: var(--text-notification-text-muted);
}
.dark .text-notification-dark-text-muted {
  color: var(--text-notification-dark-text-muted);
}

.progress-bar {
  width: 100%; /* Initial width */
  transform-origin: left; /* Animation from left to right (or use right for right to left) */
  animation-name: progress-shrink;
  animation-timing-function: linear;
  animation-fill-mode: forwards; /* Retain state at 0% width */
}

@keyframes progress-shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* List transitions (from NotificationContainer) */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-leave-active {
  position: absolute;
}
</style>
