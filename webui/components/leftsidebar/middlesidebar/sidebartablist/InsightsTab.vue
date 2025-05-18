<!-- components/leftsidebar/middlesidebar/sidebartablist/InsightsTab.vue -->

<template>
  <router-link :to="{ name: routeName }" custom v-slot="{ navigate, isExactActive }">
    <button
      class="sidebar-tab-item"
      :class="{
        'sidebar-is-collapsed': isSidebarCollapsed,
        'router-link-exact-active': isExactActive,
      }"
      @click="navigate"
      role="link"
      :aria-current="isExactActive ? 'page' : undefined"
    >
      <div class="tab-content-focusable-area">
        <div class="tab-icon-wrapper">
          <LandPlot :size="24" :stroke-width="2" />
        </div>
        <span class="tab-label" v-show="!isSidebarCollapsed">{{ label }}</span>
      </div>
    </button>
  </router-link>
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
    routeName: {
      type: String,
      required: true,
    },
  },
})
</script>

<style scoped>
@import '../../../../assets/app/leftsidebar/middlesidebar/sidebartablist/commontab.css'; /* Or specific insightstab.css */

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
  transition:
    transform 0.1s ease-out,
    outline 0.12s ease-out,
    outline-offset 0.12s ease-out;
  border-radius: 4px;
  outline: 2px solid transparent;
  outline-offset: 2px;
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
