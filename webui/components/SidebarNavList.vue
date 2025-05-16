<script setup lang="ts">
import { computed } from 'vue'
import { Server, DatabaseZap, FileClock, LandPlot } from 'lucide-vue-next'

const props = defineProps<{
  isSidebarCollapsed: boolean
  showSidebarText: boolean
  navigateTo: (path: string) => void
}>()

const navItems = [
  { path: '/', icon: LandPlot, label: 'Insights', id: 'insights' },
  { path: '/volumes', icon: Server, label: 'Volumes', id: 'volumes' },
  { path: '/collections', icon: DatabaseZap, label: 'Collections', id: 'collections' },
  { path: '/activity', icon: FileClock, label: 'Activity', id: 'activity' },
]

// 不再需要 focusRingClassesBase 和 focusRingOffsetSidebarBg 常量
// const focusRingClassesBase = ...
// const focusRingOffsetSidebarBg = ...

const handleNavigation = (path: string) => {
  if (typeof props.navigateTo === 'function') {
    props.navigateTo(path)
  }
}

// 计算用于内联样式的偏移颜色变量
const sidebarBgOffsetStyle = computed(() => ({
  '--focus-ring-offset-color': 'var(--sidebar-bg)',
  // --sidebar-bg 应该已经在 main.css 中为 .dark 定义了深色版本
}))
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
          'group cursor-pointer focusable-ui-element': !props.isSidebarCollapsed, // 应用全局焦点类到 LI
          'hover:bg-sidebar-item-hover-bg dark:hover:bg-sidebar-item-dark-hover-bg':
            !props.isSidebarCollapsed && props.showSidebarText,
        }"
        :style="!props.isSidebarCollapsed ? sidebarBgOffsetStyle : null"
        @click="!props.isSidebarCollapsed ? handleNavigation(item.path) : undefined"
        @keydown.enter="!props.isSidebarCollapsed ? handleNavigation(item.path) : undefined"
        @keydown.space.prevent="!props.isSidebarCollapsed ? handleNavigation(item.path) : undefined"
      >
        <div
          :tabindex="props.isSidebarCollapsed ? 0 : -1"
          :role="props.isSidebarCollapsed ? 'button' : undefined"
          :aria-label="props.isSidebarCollapsed ? item.label : undefined"
          class="flex-shrink-0 flex items-center justify-center rounded-md"
          :class="{
            'w-10 h-10 group/navicon cursor-pointer focusable-ui-element': props.isSidebarCollapsed, // 应用全局焦点类到图标 DIV
            'w-10 h-11': !props.isSidebarCollapsed,
            'w-10 h-10': props.isSidebarCollapsed,
          }"
          :style="props.isSidebarCollapsed ? sidebarBgOffsetStyle : null"
          @click="props.isSidebarCollapsed ? handleNavigation(item.path) : undefined"
          @keydown.enter="props.isSidebarCollapsed ? handleNavigation(item.path) : undefined"
          @keydown.space.prevent="
            props.isSidebarCollapsed ? handleNavigation(item.path) : undefined
          "
        >
          <component
            :is="item.icon"
            class="w-6 h-6 text-[var(--icon-muted-color)] transition-all duration-150 transform"
            :class="{
              'group-hover:text-[var(--icon-accent-color)] group-focus-visible:text-[var(--icon-accent-color)]':
                !props.isSidebarCollapsed,
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
.group.hover\:bg-sidebar-item-hover-bg:hover {
  /* Ensure :is() or similar if Tailwind JIT doesn't like this selector with .group */
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
