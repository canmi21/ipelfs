<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Notification } from './../composables/useNotifications'
import { useNotifications } from './../composables/useNotifications'
import { X as IconX } from 'lucide-vue-next'

const props = defineProps<{
  notification: Notification
}>()

const emit = defineEmits(['dismiss'])
const { pauseNotification, resumeNotification } = useNotifications()

const isHovered = ref(false)
// const isDismissing = ref(false) // Replaced by iconAnimationState

// --- Icon Animation State ---
type IconAnimationState = 'idle' | 'spinning' | 'fading'
const iconAnimationState = ref<IconAnimationState>('idle')

const SPIN_DURATION = 50

// --- Dark Mode Detection ---
const isDarkMode = ref(false)
let darkModeMediaQuery: MediaQueryList | undefined

const updateDarkMode = (event?: MediaQueryListEvent) => {
  isDarkMode.value = event
    ? event.matches
    : window.matchMedia('(prefers-color-scheme: dark)').matches
}

onMounted(() => {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    isDarkMode.value = darkModeMediaQuery.matches
    darkModeMediaQuery.addEventListener('change', updateDarkMode)
  }
})

onUnmounted(() => {
  if (darkModeMediaQuery) {
    darkModeMediaQuery.removeEventListener('change', updateDarkMode)
  }
})

// --- Theming based on notification type ---
const P_THEME = computed(() => {
  switch (props.notification.type) {
    case 'success':
      return {
        bgClass: 'bg-[#1c9376]',
        textClass: 'text-white',
        mutedTextClass: 'text-green-100 hover:text-white',
        focusRingClass: 'focus:ring-green-200',
      }
    case 'warning':
      return {
        bgClass: 'bg-yellow-500',
        textClass: 'text-yellow-900',
        mutedTextClass: 'text-yellow-700 hover:text-yellow-900',
        focusRingClass: 'focus:ring-yellow-800',
      }
    case 'error':
      return {
        bgClass: 'bg-[#ef4444]',
        textClass: 'text-white',
        mutedTextClass: 'text-red-100 hover:text-white',
        focusRingClass: 'focus:ring-red-200',
      }
    case 'info':
    default:
      return {
        bgClass: 'bg-[#1c9376]',
        textClass: 'text-white',
        mutedTextClass: 'text-green-100 hover:text-white',
        focusRingClass: 'focus:ring-green-200',
      }
  }
})

const S_THEME = computed(() => {
  switch (props.notification.type) {
    case 'success':
      return {
        bgClass: 'bg-[#20a784]',
        textClass: 'text-white',
        mutedTextClass: 'text-green-100 hover:text-white',
        focusRingClass: 'focus:ring-green-300',
      }
    case 'warning':
      return {
        bgClass: 'bg-yellow-400',
        textClass: 'text-yellow-800',
        mutedTextClass: 'text-yellow-600 hover:text-yellow-800',
        focusRingClass: 'focus:ring-yellow-600',
      }
    case 'error':
      return {
        bgClass: 'bg-red-400',
        textClass: 'text-white',
        mutedTextClass: 'text-red-200 hover:text-white',
        focusRingClass: 'focus:ring-red-300',
      }
    case 'info':
    default:
      return {
        bgClass: 'bg-[#20a784]',
        textClass: 'text-white',
        mutedTextClass: 'text-green-100 hover:text-white',
        focusRingClass: 'focus:ring-green-300',
      }
  }
})

const initialBgEffectiveClass = computed(() => {
  return isDarkMode.value ? P_THEME.value.bgClass : S_THEME.value.bgClass
})

const sweepFillEffectiveTheme = computed(() => {
  return isDarkMode.value ? S_THEME.value : P_THEME.value
})

const isPermanent = computed(() => props.notification.duration === 0)

const handleDismiss = () => {
  if (iconAnimationState.value !== 'idle') return // Prevent re-triggering if already dismissing

  iconAnimationState.value = 'spinning'

  // After the spin duration, transition to fading the icon and then emit dismiss
  setTimeout(() => {
    iconAnimationState.value = 'fading'

    // Emit dismiss. The parent TransitionGroup will handle the notification item's leave animation.
    // The icon's fade animation (ICON_FADE_DURATION) will run concurrently.
    emit('dismiss', props.notification.id)

    // If you need the icon to *fully* fade out before the notification item itself starts its leave animation,
    // you would nest another setTimeout here for ICON_FADE_DURATION before emitting.
    // However, allowing them to overlap slightly with the main item's leave animation is usually smoother.
    // For example, if the main item's leave is 0.5s and icon fade is 0.3s, it works well.
  }, SPIN_DURATION)
}

const handleMouseEnter = () => {
  isHovered.value = true
  if (!isPermanent.value && iconAnimationState.value === 'idle') {
    // Only pause if not permanent and not already dismissing
    pauseNotification(props.notification.id)
  }
}

const handleMouseLeave = () => {
  isHovered.value = false
  if (!isPermanent.value && iconAnimationState.value === 'idle') {
    // Only resume if not permanent and not already dismissing
    resumeNotification(props.notification.id)
  }
}

const progressBarStyle = computed(() => {
  if (isPermanent.value) {
    return { width: '100%' }
  }
  return {
    animationDuration: `${props.notification.duration}ms`,
    animationPlayState: props.notification.isPaused ? 'paused' : 'running',
  }
})

const iconDynamicClasses = computed(() => {
  return {
    'animate-spin-controller':
      iconAnimationState.value === 'spinning' || iconAnimationState.value === 'fading', // Spin class remains during fade to hold rotated state
    'animate-fade-out-controller': iconAnimationState.value === 'fading',
    'pointer-events-none': iconAnimationState.value !== 'idle', // Disable button clicks once dismissing starts
  }
})
</script>

<template>
  <div
    class="notification-item w-full max-w-sm rounded-md shadow-lg pointer-events-auto overflow-hidden relative"
    :class="[initialBgEffectiveClass]"
    role="alert"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div
      class="progress-fill absolute top-0 bottom-0 right-0 h-full"
      :class="[sweepFillEffectiveTheme.bgClass]"
      :style="progressBarStyle"
    ></div>

    <div class="relative z-10 p-3">
      <div class="flex items-center">
        <div class="w-0 flex-1">
          <p class="text-xs font-medium" :class="[sweepFillEffectiveTheme.textClass]">
            {{ notification.message }}
          </p>
        </div>
        <div class="ml-2 flex-shrink-0 w-5 h-5 flex items-center justify-center">
          <button
            @click="handleDismiss"
            type="button"
            class="inline-flex items-center justify-center rounded-md transition-opacity duration-150 focus:outline-none focus:ring-1 focus:ring-offset-1"
            :class="[
              sweepFillEffectiveTheme.mutedTextClass,
              sweepFillEffectiveTheme.focusRingClass,
              isHovered ||
              isPermanent ||
              iconAnimationState !== 'idle' /* Keep X visible during its animation */
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none',
              iconDynamicClasses['pointer-events-none'] ? 'pointer-events-none' : '',
            ]"
            aria-label="Close"
            :disabled="iconAnimationState !== 'idle'"
          >
            <IconX class="h-4 w-4" :class="iconDynamicClasses" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress-fill {
  width: 0%;
  animation-name: progress-wipe-rtl-kf; /* Added -kf suffix for clarity */
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}

@keyframes progress-wipe-rtl-kf {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

/* Icon Animations */
.animate-spin-controller {
  animation: spin-kf 1s ease-out forwards; /* Duration from SPIN_DURATION, 1 iteration is default */
  /* `forwards` ensures it stays rotated for the fade */
}
@keyframes spin-kf {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-fade-out-controller {
  animation: fade-out-kf 0.3s ease-out forwards; /* Duration from ICON_FADE_DURATION */
}
@keyframes fade-out-kf {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
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
