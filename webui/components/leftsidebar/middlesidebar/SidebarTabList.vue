<!-- components/leftsidebar/middlesidebar/SidebarTabList.vue -->

<template>
  <div class="sidebar-tab-list-container">
    <InsightsTab label="Insights" :is-sidebar-collapsed="isSidebarCollapsed" />
    <VolumesTab label="Volumes" :is-sidebar-collapsed="isSidebarCollapsed" />
    <CollectionsTab label="Collections" :is-sidebar-collapsed="isSidebarCollapsed" />
    <ActivityTab label="Activity" :is-sidebar-collapsed="isSidebarCollapsed" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import InsightsTab from './sidebartablist/InsightsTab.vue'
import VolumesTab from './sidebartablist/VolumesTab.vue'
import CollectionsTab from './sidebartablist/CollectionsTab.vue'
import ActivityTab from './sidebartablist/ActivityTab.vue'

export default defineComponent({
  name: 'SidebarTabList',
  components: {
    InsightsTab,
    VolumesTab,
    CollectionsTab,
    ActivityTab,
  },
  props: {
    isSidebarCollapsed: {
      type: Boolean,
      required: true,
    },
  },
})
</script>

<style scoped>
@import '../../../assets/app/leftsidebar/middlesidebar/sidebartablist.css';

.sidebar-tab-list-container {
  display: flex;
  flex-direction: column;
}
</style>
