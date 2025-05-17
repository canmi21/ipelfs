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
        return { size: 14, strokeWidth: 2.2 }
      } else {
        return { size: 20, strokeWidth: 2.5 }
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
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    width 0.15s ease-in-out,
    height 0.15s ease-in-out;
}

.sidebar-toggle-button.is-collapsed {
  width: 1.5rem; /* Adjusted to be slightly larger than 1rem for touchability, TopSidebar padding might need adjustment */
  height: 1.5rem; /* Or 1rem width/height if it must strictly fit 1rem content box. */
  /* If TopSidebar content box is 1rem, button of 1.5rem will be clipped by 0.25rem on each side if centered */
  /* Let's make it so it fits. TopSidebar content area = 1rem. */
  /* Button should be <= 1rem. Let's try 1.4rem, and TopSidebar padding might need to be slightly reduced if strictly 3rem total. */
  /* Sticking to the goal of fitting within 1rem content box provided by TopSidebar */
  width: 1.4rem; /* Making it slightly smaller than 1.5rem to better fit visual space if TopSidebar padding is generous */
  height: 1.4rem; /* Keeping it square */
}
</style>
