// composables/relativemain/toprightactions/useWhatIsNext.ts

import type { ThemeMode, EffectiveTheme } from './useThemeToggleButton'

export function determineNextThemeMode(
  currentPreferredMode: ThemeMode,
  currentSystemPreference: EffectiveTheme,
): ThemeMode {
  let nextMode: ThemeMode

  switch (currentPreferredMode) {
    case 'light':
      if (currentSystemPreference === 'light') {
        nextMode = 'dark'
      } else {
        nextMode = 'system'
      }
      break
    case 'dark':
      if (currentSystemPreference === 'dark') {
        nextMode = 'light'
      } else {
        nextMode = 'system'
      }
      break
    case 'system':
      if (currentSystemPreference === 'light') {
        nextMode = 'dark'
      } else {
        nextMode = 'light'
      }
      break
    default:
      nextMode = 'system'
      break
  }
  return nextMode
}
