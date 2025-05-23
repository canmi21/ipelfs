// composables/relativemain/toprightactions/useThemeToggleButton.ts

import { ref, computed, watch, readonly, type Ref, type Component } from 'vue'
import { getValueFromLocalStorage, setValueInLocalStorage } from '../../useLocalStorage'
import { Sun, Moon, SunMoon } from 'lucide-vue-next'
import { determineNextThemeMode } from './useWhatIsNext'
import type { ThemeMode, EffectiveTheme } from './useWhatIsNext'

const THEME_STORAGE_KEY = 'theme_preference_v3'
const DEFAULT_THEME_MODE: ThemeMode = 'system'
const IS_CLIENT = typeof window !== 'undefined'

const preferredThemeMode = ref<ThemeMode>(
  IS_CLIENT
    ? getValueFromLocalStorage<ThemeMode>(THEME_STORAGE_KEY, DEFAULT_THEME_MODE)
    : DEFAULT_THEME_MODE,
)

const systemPreference = ref<EffectiveTheme>(IS_CLIENT ? getSystemPreference() : 'light')
let clickCount = 0

function getSystemPreference(): EffectiveTheme {
  if (IS_CLIENT && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

const effectiveTheme = computed<EffectiveTheme>(() => {
  if (preferredThemeMode.value === 'system') {
    return systemPreference.value
  }
  return preferredThemeMode.value as EffectiveTheme
})

function applyThemeToDOM(theme: EffectiveTheme) {
  if (IS_CLIENT && document?.documentElement) {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }
}

if (IS_CLIENT) {
  watch(
    effectiveTheme,
    (newTheme) => {
      applyThemeToDOM(newTheme)
    },
    { immediate: true },
  )

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const updateSystemPreference = (event: MediaQueryListEvent | MediaQueryList) => {
    systemPreference.value = event.matches ? 'dark' : 'light'
  }

  try {
    mediaQuery.addEventListener('change', updateSystemPreference)
  } catch {
    mediaQuery.addListener(updateSystemPreference)
  }
  systemPreference.value = getSystemPreference()
}

export function useThemeToggleButton() {
  const cycleTheme = () => {
    clickCount++
    let nextMode: ThemeMode

    const currentPreferred = preferredThemeMode.value
    const currentSystem = systemPreference.value

    if (clickCount % 3 === 0) {
      if (currentPreferred === 'light' && currentSystem === 'dark') {
        nextMode = 'dark'
      } else if (currentPreferred === 'dark' && currentSystem === 'light') {
        nextMode = 'light'
      } else if (currentPreferred === 'system' && currentSystem === 'light') {
        nextMode = 'light'
      } else if (currentPreferred === 'system' && currentSystem === 'dark') {
        nextMode = 'dark'
      } else {
        nextMode = determineNextThemeMode(currentPreferred, currentSystem)
      }
    } else {
      nextMode = determineNextThemeMode(currentPreferred, currentSystem)
    }

    preferredThemeMode.value = nextMode
    if (IS_CLIENT) {
      setValueInLocalStorage<ThemeMode>(THEME_STORAGE_KEY, nextMode)
    }
  }

  const currentIconComponent = computed<Component>(() => {
    switch (preferredThemeMode.value) {
      case 'light':
        return Sun
      case 'dark':
        return Moon
      case 'system':
      default:
        return SunMoon
    }
  })

  return {
    preferredThemeMode: readonly(preferredThemeMode) as Readonly<Ref<ThemeMode>>,
    effectiveTheme: readonly(effectiveTheme) as Readonly<Ref<EffectiveTheme>>,
    cycleTheme,
    currentIconComponent,
  }
}
