// composables/leftsidebar/topsidebar/useSidebarToggleButton.ts

import { ref, readonly } from 'vue'

const isCollapsed = ref(false)

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}

export function useSidebarState() {
  return {
    isCollapsed: readonly(isCollapsed),
    toggleSidebar,
  }
}
