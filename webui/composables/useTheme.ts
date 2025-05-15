import { ref, watchEffect } from 'vue'
import { useDark } from '@vueuse/core'

export function useTheme() {
  const storedTheme = localStorage.getItem('theme')
  const isDark = useDark({
    valueDark: 'dark',
    valueLight: '', // Use empty string for light theme to remove 'dark' class
    storageKey: null, // We handle storage manually to support 'system'
    initialValue: (() => {
      if (storedTheme === 'dark') return 'dark'
      if (storedTheme === 'light') return 'light'
      try {
        const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        return systemIsDark ? 'dark' : 'light'
      } catch (e) {
        console.error('Failed to detect system color scheme:', e)
        localStorage.setItem('theme', 'dark') // Default to dark on error
        return 'dark'
      }
    })(),
  })

  const currentIcon = ref<'sun' | 'moon' | 'sun-moon'>(
    storedTheme === 'dark' ? 'moon' : storedTheme === 'light' ? 'sun' : 'sun-moon',
  )
  const currentTheme = ref<'light' | 'dark' | 'system'>(
    storedTheme === 'dark' ? 'dark' : storedTheme === 'light' ? 'light' : 'system',
  )

  const handleToggle = () => {
    if (currentTheme.value === 'light') {
      // Light -> System (or Dark if system is dark)
      try {
        const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (!systemIsDark) {
          // System is light, but we want to go to Dark next if not system
          currentIcon.value = 'moon'
          currentTheme.value = 'dark'
          isDark.value = true
          localStorage.setItem('theme', 'dark')
        } else {
          // System is dark
          currentIcon.value = 'sun-moon'
          currentTheme.value = 'system'
          isDark.value = systemIsDark // Follow system
          localStorage.removeItem('theme')
        }
      } catch (e) {
        // Fallback to dark if media query fails
        console.error('Failed to switch theme based on system preference:', e)
        currentIcon.value = 'moon'
        currentTheme.value = 'dark'
        isDark.value = true
        localStorage.setItem('theme', 'dark')
      }
    } else if (currentTheme.value === 'system') {
      // System -> Dark
      currentIcon.value = 'moon'
      currentTheme.value = 'dark'
      isDark.value = true
      localStorage.setItem('theme', 'dark')
    } else {
      // Dark -> Light
      currentIcon.value = 'sun'
      currentTheme.value = 'light'
      isDark.value = false
      localStorage.setItem('theme', 'light')
    }
  }

  watchEffect(() => {
    document.documentElement.classList.toggle('dark', isDark.value)
  })

  // Optional: Watch for system changes if currentTheme is 'system'
  watchEffect(() => {
    if (currentTheme.value === 'system') {
      try {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const systemPrefersDark = mediaQuery.matches
        isDark.value = systemPrefersDark
        // No need to update currentIcon here as it should remain 'sun-moon'
        // localStorage should already be cleared for 'system'
      } catch (e) {
        console.error('Error watching system color scheme changes', e)
      }
    }
  })

  return {
    isDark,
    currentIcon,
    currentTheme,
    handleToggle,
  }
}
