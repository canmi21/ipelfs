<!-- components/leftsidebar/topsidebar/SidebarToggleButton.vue -->

<template>
  <button
    class="sidebar-toggle-button"
    :class="{ 'is-collapsed': isCollapsed }"
    @click="handleToggleSidebar"
  >
    <component :is="currentIcon" :size="24" :stroke-width="2" />
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

    // iconProps is no longer needed as size and strokeWidth are now fixed in the template
    // isCollapsed is still used for the :class binding if any visual difference is needed
    // (other than size, e.g. if the icon itself changed more drastically, but here only type changes)

    return {
      isCollapsed, // Needed for :class if other non-size style changes based on collapse
      handleToggleSidebar,
      currentIcon,
    }
  },
})
</script>

<style scoped>
@import '../../../assets/app/leftsidebar/topsidebar/sidebartogglebutton.css';

.sidebar-toggle-button {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
