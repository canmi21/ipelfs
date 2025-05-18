// composables/useI18n.ts

import { computed, type Ref } from 'vue'
import {
  useLanguageToggle,
  type SupportedLanguage,
} from './relativemain/toprightactions/useLanguageToggle'

import enMessages from '../locales/en.json'
import zhMessages from '../locales/zh.json'

const messages: Record<SupportedLanguage, Record<string, string>> = {
  en: enMessages,
  zh: zhMessages,
}

export function useI18n() {
  const { currentLanguage } = useLanguageToggle()

  const t = (key: string): string => {
    const currentLangMessages = messages[currentLanguage.value]
    let translation = currentLangMessages?.[key]

    if (translation === undefined && currentLanguage.value !== 'en') {
      // If translation is not found in the current language and current lang is not English,
      // try falling back to English.
      const englishLangMessages = messages['en']
      translation = englishLangMessages?.[key]
    }

    return translation === undefined ? key : translation // If still not found (even in English), fallback to the key itself.
  }

  const rt = (key: string): Ref<string> => {
    return computed(() => {
      const currentLangMessages = messages[currentLanguage.value]
      let translation = currentLangMessages?.[key]

      if (translation === undefined && currentLanguage.value !== 'en') {
        // Fallback to English if not found in current language (and current is not English)
        const englishLangMessages = messages['en']
        translation = englishLangMessages?.[key]
      }

      return translation === undefined ? key : translation // Final fallback to the key
    })
  }

  return {
    t,
    rt,
    currentLanguage,
  }
}
