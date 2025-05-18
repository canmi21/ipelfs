<!-- components/leftsidebar/middlesidebar/SidebarTabList.vue -->

<template>
  <div class="sidebar-tab-list-container">
    <InsightsTab
      :label="insightsLabel"
      routeName="Insights"
      :is-sidebar-collapsed="isSidebarCollapsed"
    />
    <VolumesTab
      :label="volumesLabel"
      routeName="Volumes"
      :is-sidebar-collapsed="isSidebarCollapsed"
    />
    <CollectionsTab
      :label="collectionsLabel"
      routeName="Collections"
      :is-sidebar-collapsed="isSidebarCollapsed"
    />
    <ActivityTab
      :label="activityLabel"
      routeName="Activity"
      :is-sidebar-collapsed="isSidebarCollapsed"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import InsightsTab from './sidebartablist/InsightsTab.vue'
import VolumesTab from './sidebartablist/VolumesTab.vue'
import CollectionsTab from './sidebartablist/CollectionsTab.vue'
import ActivityTab from './sidebartablist/ActivityTab.vue'
import { useI18n } from '../../../composables/useI18n'

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
  setup() {
    const { rt } = useI18n()

    const insightsLabel = rt('sidebar.insights')
    const volumesLabel = rt('sidebar.volumes')
    const collectionsLabel = rt('sidebar.collections')
    const activityLabel = rt('sidebar.activity')

    return {
      insightsLabel,
      volumesLabel,
      collectionsLabel,
      activityLabel,
    }
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
