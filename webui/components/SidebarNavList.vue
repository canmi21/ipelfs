<script setup lang="ts">
import { Server, DatabaseZap, FileClock, LandPlot } from 'lucide-vue-next'

const props = defineProps<{
  isSidebarCollapsed: boolean
  showSidebarText: boolean
  navigateTo: (path: string) => void
}>()

// Helper for nav items, assuming you might have more or want to manage them centrally later
const navItems = [
  { path: '/', icon: LandPlot, label: 'Insights', id: 'insights' },
  { path: '/volumes', icon: Server, label: 'Volumes', id: 'volumes' },
  { path: '/collections', icon: DatabaseZap, label: 'Collections', id: 'collections' },
  { path: '/activity', icon: FileClock, label: 'Activity', id: 'activity' },
]
</script>

<template>
  <nav class="flex-grow pt-2">
    <ul class="space-y-1">
      <li
        v-for="item in navItems"
        :key="item.id"
        class="flex items-center h-11 mx-2 rounded-md group"
        :class="{
          'hover:bg-sidebar-item-hover-bg dark:hover:bg-sidebar-item-dark-hover-bg':
            !props.isSidebarCollapsed && props.showSidebarText,
        }"
      >
        <div
          tabindex="0"
          role="button"
          :aria-label="item.label"
          class="w-10 h-10 flex-shrink-0 flex items-center justify-center cursor-pointer rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sidebar-bg)] dark:focus-visible:ring-offset-[var(--sidebar-bg-dark,var(--sidebar-bg))] group/navicon"
          @click="() => props.navigateTo(item.path)"
          @keydown.enter="() => props.navigateTo(item.path)"
          @keydown.space.prevent="() => props.navigateTo(item.path)"
        >
          <component
            :is="item.icon"
            class="w-6 h-6 text-icon-muted transition-all duration-150 transform group-hover/navicon:text-icon-accent group-focus-visible/navicon:text-icon-accent"
            :class="{
              'group-hover/navicon:scale-110 group-focus-visible/navicon:scale-110':
                props.isSidebarCollapsed,
            }"
          />
        </div>
        <span
          v-if="props.showSidebarText"
          class="pl-1 pr-2 text-base font-medium text-sidebar-main transition-colors duration-150 truncate select-none pointer-events-none group-hover:text-icon-accent"
        >
          {{ item.label }}
        </span>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.text-sidebar-main {
  color: var(--sidebar-text-main);
}
.text-icon-muted {
  color: var(--icon-muted-color);
}
/* Icon color on hover/focus is now handled by group-hover/navicon and group-focus-visible/navicon */
/* The :deep(svg) approach for direct children is an alternative if group variants are complex */

/* For text hover when LI is hovered (expanded sidebar) */
.group:hover .text-sidebar-main {
  color: var(--icon-accent-color);
}

.hover\:bg-sidebar-item-hover-bg:hover {
  background-color: var(--sidebar-item-hover-bg);
}
.dark .dark\:hover\:bg-sidebar-item-dark-hover-bg:hover {
  background-color: var(--sidebar-item-dark-hover-bg);
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
