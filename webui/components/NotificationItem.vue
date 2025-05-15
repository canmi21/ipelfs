<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Notification } from './../composables/useNotifications'
import { useNotifications } from './../composables/useNotifications'
import { X as IconX } from 'lucide-vue-next'

const props = defineProps<{
  notification: Notification
}>()

const emit = defineEmits(['dismiss'])
const { pauseNotification, resumeNotification } = useNotifications()

const isHovered = ref(false)

// --- Theming ---
// Primary theme (final color of the notification and text/icon colors)
const primaryTheme = computed(() => {
  switch (props.notification.type) {
    case 'success':
      return {
        bgClass: 'bg-[#1c9376]',
        textClass: 'text-white',
        mutedTextClass: 'text-green-100 hover:text-white',
        focusRingClass: 'focus:ring-green-200',
      } // Added comma
    case 'warning':
      // Yellow background usually needs darker text for contrast
      return {
        bgClass: 'bg-yellow-500',
        textClass: 'text-yellow-900',
        mutedTextClass: 'text-yellow-700 hover:text-yellow-900',
        focusRingClass: 'focus:ring-yellow-800',
      } // Added comma
    case 'error':
      return {
        bgClass: 'bg-[#ef4444]',
        textClass: 'text-white',
        mutedTextClass: 'text-red-100 hover:text-white',
        focusRingClass: 'focus:ring-red-200',
      } // Added comma
    case 'info':
    default: // Default is green
      return {
        bgClass: 'bg-[#1c9376]',
        textClass: 'text-white',
        mutedTextClass: 'text-green-100 hover:text-white',
        focusRingClass: 'focus:ring-green-200',
      } // Added comma
  }
})

// Secondary theme (initial background color that gets "wiped" by the primary color)
// This color should be subtly different from the primary/final color.
const secondaryBgClass = computed(() => {
  switch (props.notification.type) {
    case 'success':
      return 'bg-[#20a784]' // A slightly lighter/different green than #1c9376
    case 'warning':
      return 'bg-yellow-400' // Lighter yellow than yellow-500
    case 'error':
      return 'bg-red-400' // Lighter red than #ef4444
    case 'info':
    default:
      return 'bg-[#20a784]' // Default to the different green
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
const progressBarStyle = computed(() => ({
  animationDuration: `${props.notification.duration}ms`,
  animationPlayState: props.notification.isPaused ? 'paused' : 'running',
}))

// This key can be used to force re-render the progress bar if needed,
// for example, if we wanted the animation to visually "jump" when resuming
// after a long pause to reflect remainingTime. For now, CSS pause/play is simpler.
// const progressBarKey = ref(0);
// watch(() => props.notification.remainingDuration, () => {
//   progressBarKey.value++;
// });
</script>

<template>
  <div
    class="notification-item w-full max-w-sm rounded-md shadow-lg pointer-events-auto overflow-hidden relative"
    :class="[secondaryBgClass]"
    role="alert"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div
      class="progress-fill absolute top-0 bottom-0 right-0 h-full"
      :class="[primaryTheme.bgClass]"
      :style="progressBarStyle"
    ></div>

    <div class="relative z-10 p-3">
      <div class="flex items-center">
        <div class="w-0 flex-1">
          <p class="text-xs font-medium" :class="[primaryTheme.textClass]">
            {{ notification.message }}
          </p>
        </div>
        <div class="ml-2 flex-shrink-0 w-5 h-5 flex items-center justify-center">
          <button
            @click="handleDismiss"
            type="button"
            class="inline-flex items-center justify-center rounded-md transition-opacity duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1"
            :class="[
              primaryTheme.mutedTextClass,
              primaryTheme.focusRingClass,
              isHovered ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
            ]"
            aria-label="Close"
          >
            <IconX class="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Text and Muted Text colors are now driven by primaryTheme computed property and applied via Tailwind classes. */
/* No need for --text-notification CSS variables here anymore if Tailwind classes cover all cases. */

.progress-fill {
  width: 0%; /* Initial width for the fill starting from the right */
  animation-name: progress-wipe-rtl;
  animation-timing-function: linear;
  animation-fill-mode: forwards; /* Retain state at 100% width */
}

@keyframes progress-wipe-rtl {
  from {
    width: 0%;
  }
  to {
    width: 100%;
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
