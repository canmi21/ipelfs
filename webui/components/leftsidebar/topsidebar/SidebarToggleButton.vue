<!-- components/leftsidebar/topsidebar/SidebarToggleButton.vue -->

<template>
  <button class="sidebar-toggle-button" @click="handleToggleSidebar">
    <component :is="currentIcon" :size="20" stroke-width="2.5" />
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
      return isCollapsed.value ? PanelRightClose : PanelRightOpen
    })

    return {
      isCollapsed,
      handleToggleSidebar,
      currentIcon,
    }
  },
})
</script>

<style scoped>
@import '../../../assets/app/leftsidebar/topsidebar/sidebartogglebutton.css';

.sidebar-toggle-button {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
