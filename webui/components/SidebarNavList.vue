<script setup lang="ts">
import { Server, DatabaseZap, FileClock, LandPlot } from 'lucide-vue-next'

const props = defineProps<{
  isSidebarCollapsed: boolean
  showSidebarText: boolean // This prop implies sidebar is expanded if true
  navigateTo: (path: string) => void
}>()

const navItems = [
  { path: '/', icon: LandPlot, label: 'Insights', id: 'insights' },
  { path: '/volumes', icon: Server, label: 'Volumes', id: 'volumes' },
  { path: '/collections', icon: DatabaseZap, label: 'Collections', id: 'collections' },
  { path: '/activity', icon: FileClock, label: 'Activity', id: 'activity' },
]

// Helper to DRY focus ring classes
const focusRingClassesBase =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500 focus-visible:ring-offset-2'
const focusRingOffsetSidebarBg =
  'focus-visible:ring-offset-[var(--sidebar-bg)] dark:focus-visible:ring-offset-[var(--sidebar-bg-dark,var(--sidebar-bg))]'
</script>

<template>
  <nav class="flex-grow pt-2">
    <ul class="space-y-1">
      <li
        v-for="item in navItems"
        :key="item.id"
        :tabindex="!props.isSidebarCollapsed ? 0 : -1"
        role="button"
        :aria-label="item.label"
        class="flex items-center h-11 mx-2 rounded-md"
        :class="{
          'group cursor-pointer': !props.isSidebarCollapsed, // LI is group and clickable when expanded
          [focusRingClassesBase]: !props.isSidebarCollapsed, // Apply base ring to LI when expanded
          [focusRingOffsetSidebarBg]: !props.isSidebarCollapsed, // Apply offset to LI when expanded
          'hover:bg-sidebar-item-hover-bg dark:hover:bg-sidebar-item-dark-hover-bg':
            !props.isSidebarCollapsed && props.showSidebarText,
        }"
        @click="!props.isSidebarCollapsed ? () => props.navigateTo(item.path) : undefined"
        @keydown.enter="!props.isSidebarCollapsed ? () => props.navigateTo(item.path) : undefined"
        @keydown.space.prevent="
          !props.isSidebarCollapsed ? () => props.navigateTo(item.path) : undefined
        "
      >
        <div
          :tabindex="props.isSidebarCollapsed ? 0 : -1"
          :role="props.isSidebarCollapsed ? 'button' : undefined"
          :aria-label="props.isSidebarCollapsed ? item.label : undefined"
          class="flex-shrink-0 flex items-center justify-center rounded-md"
          :class="{
            'w-10 h-10 group/navicon cursor-pointer': props.isSidebarCollapsed, // Icon div is group and clickable when collapsed
            [focusRingClassesBase]: props.isSidebarCollapsed, // Apply base ring to icon div when collapsed
            [focusRingOffsetSidebarBg]: props.isSidebarCollapsed, // Apply offset to icon div when collapsed
            'w-10 h-11': !props.isSidebarCollapsed, // Regular icon container size when expanded
            'w-10 h-10': props.isSidebarCollapsed, // Ensure square-ish for collapsed focus ring
          }"
          @click="props.isSidebarCollapsed ? () => props.navigateTo(item.path) : undefined"
          @keydown.enter="props.isSidebarCollapsed ? () => props.navigateTo(item.path) : undefined"
          @keydown.space.prevent="
            props.isSidebarCollapsed ? () => props.navigateTo(item.path) : undefined
          "
        >
          <component
            :is="item.icon"
            class="w-6 h-6 text-[var(--icon-muted-color)] transition-all duration-150 transform"
            :class="{
              // Expanded: icon reacts to LI (group) focus/hover
              'group-hover:text-[var(--icon-accent-color)] group-focus-visible:text-[var(--icon-accent-color)]':
                !props.isSidebarCollapsed,
              // Collapsed: icon reacts to icon DIV (group/navicon) focus/hover AND scales
              'group-hover/navicon:text-[var(--icon-accent-color)] group-focus-visible/navicon:text-[var(--icon-accent-color)]':
                props.isSidebarCollapsed,
              'group-hover/navicon:scale-110 group-focus-visible/navicon:scale-110':
                props.isSidebarCollapsed,
            }"
          />
        </div>
        <span
          v-if="props.showSidebarText"
          class="pl-1 pr-2 text-base font-medium text-sidebar-main transition-colors duration-150 truncate select-none pointer-events-none"
          :class="{
            // Expanded: text reacts to LI (group) focus/hover
            'group-hover:text-[var(--icon-accent-color)] group-focus-visible:text-[var(--icon-accent-color)]':
              !props.isSidebarCollapsed,
          }"
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
/* Base icon color is applied directly in template: text-[var(--icon-muted-color)] */

/* Hover background for LI when expanded and text is shown */
.group.hover\:bg-sidebar-item-hover-bg:hover {
  /* This specific class is for when showSidebarText is true */
  background-color: var(--sidebar-item-hover-bg);
}
.dark .group.dark\:hover\:bg-sidebar-item-dark-hover-bg:hover {
  background-color: var(--sidebar-item-dark-hover-bg);
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
