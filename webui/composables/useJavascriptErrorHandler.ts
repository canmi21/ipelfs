import { ref, onMounted } from 'vue'

export function useJavascriptErrorHandler() {
  const showJavascriptErrorOverlay = ref(false)
  const jsErrorHelpLink = 'https://www.enable-javascript.com/' // Make it configurable if needed

  onMounted(() => {
    // A simple check to see if basic JS features are unavailable (e.g. very old browser or JS disabled)
    if (typeof window.addEventListener === 'undefined') {
      showJavascriptErrorOverlay.value = true
    }
  })

  return {
    showJavascriptErrorOverlay,
    jsErrorHelpLink,
  }
}
