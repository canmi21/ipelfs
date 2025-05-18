<!-- components/leftsidebar/middlesidebar/sidebartablist/VolumesTab.vue -->

<template>
  <button class="sidebar-tab-item" :class="{ 'sidebar-is-collapsed': isSidebarCollapsed }">
    <div class="tab-content-focusable-area">
      <div class="tab-icon-wrapper">
        <HardDrive :size="24" :stroke-width="2" />
      </div>
      <transition name="fade-tab-label">
        <span class="tab-label" v-show="!isSidebarCollapsed">{{ label }}</span>
      </transition>
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

.tab-content-focusable-area {
  display: inline-flex;
  align-items: center;
  height: 1.5rem;
  border-radius: 4px;
  outline: 3px solid transparent;
  outline-offset: 2px;
}

.tab-icon-wrapper {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.1s ease-out;
  border-radius: 4px;
}

.tab-label {
  margin-left: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5rem;
}

.fade-tab-label-enter-active,
.fade-tab-label-leave-active {
  transition: opacity 0.15s ease-in-out;
}

.fade-tab-label-enter-from,
.fade-tab-label-leave-to {
  opacity: 0;
}

.fade-tab-label-enter-to,
.fade-tab-label-leave-from {
  opacity: 1;
}
</style>
