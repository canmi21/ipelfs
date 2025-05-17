<!-- components/leftsidebar/topsidebar/SidebarToggleButton.vue -->

<template>
  <button
    class="sidebar-toggle-button"
    :class="{ 'is-collapsed': isCollapsed }"
    @click="handleToggleSidebar"
  >
    <component :is="currentIcon" :size="iconProps.size" :stroke-width="iconProps.strokeWidth" />
  </button>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { PanelRightClose, PanelRightOpen } from 'lucide-vue-next'
import { useSidebarState } from '../../../composables/leftsidebar/topsidebar/useSidebarToggleButton'

export default defineComponent({
  name: 'SidebarToggleButton',
  components: {
    PanelRightClose,
    PanelRightOpen,
  },
  setup() {
    const { isCollapsed, toggleSidebar } = useSidebarState()

    const handleToggleSidebar = () => {
      toggleSidebar()
    }

    const currentIcon = computed(() => {
      return isCollapsed.value ? PanelRightOpen : PanelRightClose
    })

    const iconProps = computed(() => {
      if (isCollapsed.value) {
        return { size: 24, strokeWidth: 2 } // Icon size 1.5rem (24px)
      } else {
        return { size: 20, strokeWidth: 2.5 } // Expanded state icon size
      }
    })

    return {
      isCollapsed,
      handleToggleSidebar,
      currentIcon,
      iconProps,
    }
  },
})
</script>

<style scoped>
@import '../../../assets/app/leftsidebar/topsidebar/sidebartogglebutton.css';

.sidebar-toggle-button {
  width: 2rem; /* Expanded state button width */
  height: 2rem; /* Expanded state button height */
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    width 0.15s ease-in-out,
    height 0.15s ease-in-out,
    opacity 0.15s ease-in-out;
}

.sidebar-toggle-button.is-collapsed {
  width: 1.5rem; /* Collapsed state button width to match 1.5rem icon */
  height: 1.5rem; /* Collapsed state button height */
}
</style>
