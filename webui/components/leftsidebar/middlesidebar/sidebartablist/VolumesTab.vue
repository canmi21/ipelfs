<!-- components/leftsidebar/middlesidebar/sidebartablist/VolumesTab.vue -->

<template>
  <button class="sidebar-tab-item" :class="{ 'sidebar-is-collapsed': isSidebarCollapsed }">
    <div class="tab-content-focusable-area">
      <div class="tab-icon-wrapper">
        <HardDrive :size="24" :stroke-width="2" />
      </div>
      <span class="tab-label" v-show="!isSidebarCollapsed">{{ label }}</span>
    </div>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { HardDrive } from 'lucide-vue-next'
export default defineComponent({
  name: 'VolumesTab',
  components: { HardDrive },
  props: {
    label: { type: String, required: true },
    isSidebarCollapsed: { type: Boolean, required: true },
  },
})
</script>

<style scoped>
@import '../../../../assets/app/leftsidebar/middlesidebar/sidebartablist/commontab.css'; /* Or specific insightstab.css */

.sidebar-tab-item {
  /* This is the <button> */
  height: 3rem;
  width: 100%;
  display: flex;
  align-items: center; /* Vertically centers tab-content-focusable-area */
  box-sizing: border-box;
  /* Button's padding positions the .tab-content-focusable-area's start point */
  /* Icon center at 1.5rem from left: button padding-left 0.75rem. */
  /* Then .tab-content-focusable-area starts, and its first child .tab-icon-wrapper (1.5rem wide) will be centered at 0.75rem within that area if that area has padding, or if the area itself is positioned. */
  /* Simpler: position .tab-content-focusable-area using margin on itself or padding on button */
  padding-left: 0.75rem; /* This ensures the content starts 0.75rem from the button's left edge */
  padding-right: 0.75rem; /* Padding on the right of the button */
}

.tab-content-focusable-area {
  display: inline-flex; /* Hugs the width of its content (icon + text or just icon) */
  align-items: center; /* Vertically aligns icon and text within this area */
  height: 1.5rem; /* Fixed height for the focusable content and thus the focus ring */
  border-radius: 4px; /* For the outline to be rounded */
  outline: 3px solid transparent; /* Pre-allocate space for outline, matches focus-visible width */
  outline-offset: 2px;
  /* Transitions for transform and outline-color are now in commontab.css for this element */
}

.tab-icon-wrapper {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  /* No border-radius or outline here, moved to .tab-content-focusable-area */
  /* No transform transition here, moved to .tab-content-focusable-area via commontab.css */
}

.tab-label {
  margin-left: 0.75rem; /* Space between icon and text */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5rem; /* Align text baseline with icon center if icon wrapper is 1.5rem high */
  /* flex-grow: 1; /* Not needed if parent .tab-content-focusable-area is inline-flex */
}
</style>
