// composables/relativemain/toprightactions/useWhatIsNext.ts

export type ThemeMode = 'light' | 'dark' | 'system'
export type EffectiveTheme = 'light' | 'dark'

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
