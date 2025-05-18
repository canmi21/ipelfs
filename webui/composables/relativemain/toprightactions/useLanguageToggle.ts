// composables/relativemain/toprightactions/useLanguageToggle.ts

import { ref, readonly, watch, type Ref } from 'vue'
import { getValueFromLocalStorage, setValueInLocalStorage } from '../../useLocalStorage'

export type SupportedLanguage = 'en' | 'zh'

const LANGUAGE_STORAGE_KEY = 'user_language_preference_v1'
const DEFAULT_LANGUAGE: SupportedLanguage = 'en'
const IS_CLIENT = typeof window !== 'undefined'

const currentLanguage = ref<SupportedLanguage>(
  IS_CLIENT
    ? getValueFromLocalStorage<SupportedLanguage>(LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE)
    : DEFAULT_LANGUAGE,
)

function applyLanguageToHTML(lang: SupportedLanguage) {
  if (IS_CLIENT && document?.documentElement) {
    document.documentElement.setAttribute('lang', lang)
  }
}

if (IS_CLIENT) {
  watch(
    currentLanguage,
    (newLang) => {
      applyLanguageToHTML(newLang)
    },
    { immediate: true },
  )
}

export function useLanguageToggle() {
  const toggleLanguage = () => {
    const newLang = currentLanguage.value === 'en' ? 'zh' : 'en'
    currentLanguage.value = newLang
    if (IS_CLIENT) {
      setValueInLocalStorage<SupportedLanguage>(LANGUAGE_STORAGE_KEY, newLang)
      // The watch on currentLanguage will call applyLanguageToHTML
    }
  }

  return {
    currentLanguage: readonly(currentLanguage) as Readonly<Ref<SupportedLanguage>>,
    toggleLanguage,
  }
}
