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
type IconAnimationState = 'idle' | 'spinning' | 'fading'
const iconAnimationState = ref<IconAnimationState>('idle')

const SPIN_DURATION = 100

// --- Enhanced Dark Mode Detection (respecting localStorage and system preference) ---
const effectiveIsDark = ref(false)
let systemThemeMediaQuery: MediaQueryList | null = null

const handleSystemThemeChange = (event: MediaQueryListEvent) => {
  if (localStorage.getItem('theme') === null) {
    effectiveIsDark.value = event.matches
  }
}

const checkAndUpdateEffectiveDarkMode = () => {
  const storedTheme = localStorage.getItem('theme')
  if (storedTheme === 'dark') {
    effectiveIsDark.value = true
    if (systemThemeMediaQuery) {
      systemThemeMediaQuery.removeEventListener('change', handleSystemThemeChange)
      // systemThemeMediaQuery = null; // Keep it to re-attach if localStorage is cleared
    }
  } else if (storedTheme === 'light') {
    effectiveIsDark.value = false
    if (systemThemeMediaQuery) {
      systemThemeMediaQuery.removeEventListener('change', handleSystemThemeChange)
      // systemThemeMediaQuery = null;
    }
  } else {
    // System preference (localStorage is null or not 'dark'/'light')
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      if (!systemThemeMediaQuery) {
        // Initialize and add listener only once or if cleared
        systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        // Add listener only if it wasn't added before or re-add if necessary
        // To prevent multiple listeners, we can remove then add, or check if already listening (complex)
        // For simplicity, we might rely on onUnmounted to clean up.
        // A robust way is to remove first if re-attaching.
        try {
          // Removing first in case it was somehow attached before
          systemThemeMediaQuery.removeEventListener('change', handleSystemThemeChange)
        } catch (_e) {
          /* ignore if not attached */
        }
        systemThemeMediaQuery.addEventListener('change', handleSystemThemeChange)
      }
      effectiveIsDark.value = systemThemeMediaQuery.matches
    } else {
      effectiveIsDark.value = false // Fallback for non-browser environments
    }
  }
}

const handleStorageChange = (event: StorageEvent) => {
  if (event.key === 'theme' || event.key === null) {
    // event.key is null for localStorage.clear()
    checkAndUpdateEffectiveDarkMode()
  }
}

onMounted(() => {
  checkAndUpdateEffectiveDarkMode() // Initial check
  window.addEventListener('storage', handleStorageChange) // Listen for localStorage changes from other tabs/windows
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  if (systemThemeMediaQuery) {
    systemThemeMediaQuery.removeEventListener('change', handleSystemThemeChange)
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

// --- Determine current themes based on light/dark mode ---
const initialBgEffectiveClass = computed(() => {
  return effectiveIsDark.value ? P_THEME.value.bgClass : S_THEME.value.bgClass
})

const sweepFillEffectiveTheme = computed(() => {
  return effectiveIsDark.value ? S_THEME.value : P_THEME.value
})

const isPermanent = computed(() => props.notification.duration === 0)

const handleDismiss = () => {
  if (iconAnimationState.value !== 'idle') return
  iconAnimationState.value = 'spinning'
  setTimeout(() => {
    iconAnimationState.value = 'fading'
    emit('dismiss', props.notification.id)
  }, SPIN_DURATION)
}

const handleMouseEnter = () => {
  isHovered.value = true
  if (!isPermanent.value && iconAnimationState.value === 'idle') {
    pauseNotification(props.notification.id)
  }
}

const handleMouseLeave = () => {
  isHovered.value = false
  if (!isPermanent.value && iconAnimationState.value === 'idle') {
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
    // Using the class name from your previous working version's CSS
    'animate-spin-one-slow':
      iconAnimationState.value === 'spinning' || iconAnimationState.value === 'fading',
    'animate-fade-out-controller': iconAnimationState.value === 'fading',
    'pointer-events-none': iconAnimationState.value !== 'idle',
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
              isHovered || isPermanent || iconAnimationState !== 'idle'
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
  animation-name: progress-wipe-rtl-kf;
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

/* Using the animation name from your previous version for the spin */
.animate-spin-one-slow {
  animation-name: spin-one-slow-kf; /* Matches the keyframe name from your previous CSS */
  animation-duration: 1s; /* Duration from SPIN_DURATION */
  animation-timing-function: ease-out;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
}

@keyframes spin-one-slow-kf {
  /* Ensure this keyframe name matches */
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
