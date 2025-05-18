<!-- components/leftsidebar/topsidebar/SidebarToggleButton.vue -->

<template>
  <div class="toggle-button-slot" :class="{ 'is-collapsed-slot': isCollapsed }">
    <button class="sidebar-toggle-button" @click="handleToggleSidebar">
      <component :is="currentIcon" :size="24" :stroke-width="2" />
    </button>
  </div>
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
      isCollapsed, // Used for the slot's class if needed, or passed to button if button style changes
      handleToggleSidebar,
      currentIcon,
    }
  },
})
</script>

<style scoped>
@import '../../../assets/app/leftsidebar/topsidebar/sidebartogglebutton.css';

.toggle-button-slot {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* Prevent slot from shrinking in flex layout */
}

.sidebar-toggle-button {
  /* This is the inner 1.5rem x 1.5rem button */
  width: 1.5rem;
  height: 1.5rem;
  /* Styling (transparent bg, color, focus etc.) is in the imported CSS */
  /* display:flex, align-items, justify-content for icon centering is also in imported CSS */
}
</style>
