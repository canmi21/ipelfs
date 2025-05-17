// composables/leftsidebar/useSidebar.ts

import { ref, readonly, type Ref } from 'vue'
import { getValueFromLocalStorage, setValueInLocalStorage } from '../useLocalStorage'

const LOCAL_STORAGE_KEY_SIDEBAR_COLLAPSED = 'sidebar_collapsed_preference'

const initialCollapsedState = getValueFromLocalStorage<boolean>(
  LOCAL_STORAGE_KEY_SIDEBAR_COLLAPSED,
  false,
)
const _isCollapsed = ref<boolean>(initialCollapsedState)

function toggleSidebar(): void {
  _isCollapsed.value = !_isCollapsed.value
  setValueInLocalStorage<boolean>(LOCAL_STORAGE_KEY_SIDEBAR_COLLAPSED, _isCollapsed.value)
}

export function useSidebar() {
  return {
    isCollapsed: readonly(_isCollapsed) as Readonly<Ref<boolean>>,
    toggleSidebar,
  }
}
