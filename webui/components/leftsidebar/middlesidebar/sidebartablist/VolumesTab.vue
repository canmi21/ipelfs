<!-- components/leftsidebar/middlesidebar/sidebartablist/VolumesTab.vue -->

<template>
  <button class="sidebar-tab-item">
    <div class="tab-icon-wrapper">
      <HardDrive :size="24" :stroke-width="2" />
    </div>
    <span class="tab-label" v-show="!isSidebarCollapsed">{{ label }}</span>
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
@import '../../../../assets/app/leftsidebar/middlesidebar/sidebartablist/commontab.css';
.sidebar-tab-item {
  height: 3rem;
  width: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}
.tab-icon-wrapper {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
