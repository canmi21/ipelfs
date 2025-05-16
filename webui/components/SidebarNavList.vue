<script setup lang="ts">
import { Server, DatabaseZap, FileClock, LandPlot } from 'lucide-vue-next'

const props = defineProps<{
  isSidebarCollapsed: boolean
  showSidebarText: boolean
  navigateTo: (path: string) => void
}>()
</script>

<template>
  <nav class="flex-grow pt-2">
    <ul class="space-y-1">
      <li
        tabindex="0"
        @click="() => props.navigateTo('/')"
        @keydown.enter="() => props.navigateTo('/')"
        @keydown.space="() => props.navigateTo('/')"
        class="cursor-pointer group rounded-md flex items-center h-11 mx-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--sidebar-bg)] dark:focus-visible:ring-offset-[var(--sidebar-bg)]"
        :class="{
          'hover:bg-sidebar-item-hover-bg dark:hover:bg-sidebar-item-dark-hover-bg':
            !props.isSidebarCollapsed,
        }"
      >
        <div class="w-10 h-11 flex-shrink-0 flex items-center justify-center">
          <LandPlot
            class="w-6 h-6 text-icon-muted transition-all duration-150 transform group-hover:text-icon-accent"
            :class="{ 'group-hover:scale-110': props.isSidebarCollapsed }"
          />
        </div>
        <span
          v-if="props.showSidebarText"
          class="pl-1 pr-2 text-base font-medium text-sidebar-main group-hover:text-icon-accent transition-colors duration-150 truncate"
        >
          Insights
        </span>
      </li>
      <li
        tabindex="0"
        @click="() => props.navigateTo('/volumes')"
        @keydown.enter="() => props.navigateTo('/volumes')"
        @keydown.space="() => props.navigateTo('/volumes')"
        class="cursor-pointer group rounded-md flex items-center h-11 mx-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--sidebar-bg)] dark:focus-visible:ring-offset-[var(--sidebar-bg)]"
        :class="{
          'hover:bg-sidebar-item-hover-bg dark:hover:bg-sidebar-item-dark-hover-bg':
            !props.isSidebarCollapsed,
        }"
      >
        <div class="w-10 h-11 flex-shrink-0 flex items-center justify-center">
          <Server
            class="w-6 h-6 text-icon-muted transition-all duration-150 transform group-hover:text-icon-accent"
            :class="{ 'group-hover:scale-110': props.isSidebarCollapsed }"
          />
        </div>
        <span
          v-if="props.showSidebarText"
          class="pl-1 pr-2 text-base font-medium text-sidebar-main group-hover:text-icon-accent transition-colors duration-150 truncate"
        >
          Volumes
        </span>
      </li>
      <li
        tabindex="0"
        @click="() => props.navigateTo('/collections')"
        @keydown.enter="() => props.navigateTo('/collections')"
        @keydown.space="() => props.navigateTo('/collections')"
        class="cursor-pointer group rounded-md flex items-center h-11 mx-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--sidebar-bg)] dark:focus-visible:ring-offset-[var(--sidebar-bg)]"
        :class="{
          'hover:bg-sidebar-item-hover-bg dark:hover:bg-sidebar-item-dark-hover-bg':
            !props.isSidebarCollapsed,
        }"
      >
        <div class="w-10 h-11 flex-shrink-0 flex items-center justify-center">
          <DatabaseZap
            class="w-6 h-6 text-icon-muted transition-all duration-150 transform group-hover:text-icon-accent"
            :class="{ 'group-hover:scale-110': props.isSidebarCollapsed }"
          />
        </div>
        <span
          v-if="props.showSidebarText"
          class="pl-1 pr-2 text-base font-medium text-sidebar-main group-hover:text-icon-accent transition-colors duration-150 truncate"
        >
          Collections
        </span>
      </li>
      <li
        tabindex="0"
        @click="() => props.navigateTo('/activity')"
        @keydown.enter="() => props.navigateTo('/activity')"
        @keydown.space="() => props.navigateTo('/activity')"
        class="cursor-pointer group rounded-md flex items-center h-11 mx-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--sidebar-bg)] dark:focus-visible:ring-offset-[var(--sidebar-bg)]"
        :class="{
          'hover:bg-sidebar-item-hover-bg dark:hover:bg-sidebar-item-dark-hover-bg':
            !props.isSidebarCollapsed,
        }"
      >
        <div class="w-10 h-11 flex-shrink-0 flex items-center justify-center">
          <FileClock
            class="w-6 h-6 text-icon-muted transition-all duration-150 transform group-hover:text-icon-accent"
            :class="{ 'group-hover:scale-110': props.isSidebarCollapsed }"
          />
        </div>
        <span
          v-if="props.showSidebarText"
          class="pl-1 pr-2 text-base font-medium text-sidebar-main group-hover:text-icon-accent transition-colors duration-150 truncate"
        >
          Activity
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
.group:hover .group-hover\:text-icon-accent {
  color: var(--icon-accent-color) !important;
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
