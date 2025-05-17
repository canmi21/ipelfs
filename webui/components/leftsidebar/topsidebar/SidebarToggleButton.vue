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
import { useSidebar } from '../../../composables/leftsidebar/useSidebar'

export default defineComponent({
  name: 'SidebarToggleButton',
  components: {
    PanelRightClose,
    PanelRightOpen,
  },
  setup() {
    const { isCollapsed, toggleSidebar } = useSidebar()

    const handleToggleSidebar = () => {
      toggleSidebar()
    }

    const currentIcon = computed(() => {
      return isCollapsed.value ? PanelRightOpen : PanelRightClose
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
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    opacity 0.15s ease-in-out,
    color 0.12s ease-out,
    transform 0.12s ease-out;
}
</style>
