<!-- components/leftsidebar/middlesidebar/sidebartablist/InsightsTab.vue -->

<template>
  <button class="sidebar-tab-item">
    <div class="tab-icon-wrapper">
      <LandPlot :size="24" :stroke-width="2" />
    </div>
    <span class="tab-label" v-show="!isSidebarCollapsed">{{ label }}</span>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { LandPlot } from 'lucide-vue-next'

export default defineComponent({
  name: 'InsightsTab',
  components: {
    LandPlot,
  },
  props: {
    label: {
      type: String,
      required: true,
    },
    isSidebarCollapsed: {
      type: Boolean,
      required: true,
    },
  },
})
</script>

<style scoped>
@import '../../../../assets/app/leftsidebar/middlesidebar/sidebartablist/commontab.css';

.sidebar-tab-item {
  height: 3rem;
  width: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding-left: 0.75rem; /* Positions the icon container: 1.5rem (centerline) - 0.75rem (half icon container) */
  padding-right: 0.75rem; /* General padding on the right */
}

.tab-icon-wrapper {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* Prevent icon wrapper from shrinking */
  /* Transition for scale effect on active is now in the external CSS if targeted */
  transition: transform 0.1s ease-out;
}

.tab-label {
  margin-left: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
}
</style>
