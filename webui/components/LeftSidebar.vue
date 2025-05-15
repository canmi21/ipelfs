<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  PanelRightOpen,
  PanelRightClose,
  SquareArrowOutUpRight,
  Server, // Still needed for the footer
  ServerOff, // Still needed for the footer
  // DatabaseZap, FileClock are moved to SidebarNavList
} from 'lucide-vue-next'
import SidebarNavList from './SidebarNavList.vue' // Import the new component

// Props from App.vue (or a composable if App.vue uses useSidebar)
const props = defineProps<{
  isSidebarCollapsed: boolean
  showSidebarText: boolean
  showGithubIcon: boolean // Renamed for clarity within sidebar context
  showInlineStatusText: boolean // Renamed for clarity
  sidebarWidthClass: string
  isBackendConnected: boolean // Pass backend status for the icon
  formattedLatency: string | null
  latencyMs: number | null
  healthCheckTimerId: number | undefined
}>()

// Emit an event to App.vue to toggle the sidebar
const emit = defineEmits(['toggle-sidebar', 'open-external-link'])

const router = useRouter()
const navigateTo = (path: string) => {
  router.push(path)
}

const handleToggle = () => {
  emit('toggle-sidebar')
}

const openRepoLink = () => {
  emit('open-external-link', 'https://github.com/canmi21/ipelfs')
}
</script>

<template>
  <div
    :class="props.sidebarWidthClass"
    class="fixed top-0 left-0 h-full bg-sidebar z-30 transition-all ease-in-out duration-300 overflow-hidden flex flex-col"
  >
    <div class="shrink-0">
      <div class="h-14 flex items-center">
        <div class="w-14 h-14 flex-shrink-0 flex items-center justify-center">
          <div
            @click="handleToggle"
            class="cursor-pointer p-1.5 rounded-md group"
            title="Toggle Sidebar"
          >
            <component
              :is="props.isSidebarCollapsed ? PanelRightClose : PanelRightOpen"
              class="w-6 h-6 text-icon-muted group-hover:text-icon-accent transform transition-all duration-150 group-hover:scale-110"
            />
          </div>
        </div>
        <div
          v-if="!props.isSidebarCollapsed && props.showGithubIcon"
          @click="openRepoLink"
          class="cursor-pointer p-1.5 rounded-md group ml-auto mr-3"
          title="Open GitHub Repository"
        >
          <SquareArrowOutUpRight
            class="w-5 h-5 text-icon-muted group-hover:text-icon-accent transform transition-all duration-150 group-hover:scale-110"
          />
        </div>
      </div>
      <div class="border-b border-sidebar-border mx-2"></div>
    </div>

    <SidebarNavList
      :is-sidebar-collapsed="props.isSidebarCollapsed"
      :show-sidebar-text="props.showSidebarText"
      :navigate-to="navigateTo"
    />

    <div class="mt-auto shrink-0 mx-2 mb-2 border-t border-sidebar-border pt-2">
      <div class="flex items-center h-11 rounded-md cursor-default">
        <div class="w-10 h-11 flex-shrink-0 flex items-center justify-center">
          <component
            :is="props.isBackendConnected ? Server : ServerOff"
            class="w-6 h-6 flex-shrink-0 transition-colors duration-150"
            :class="{
              'text-status-connected': props.isBackendConnected,
              'text-status-disconnected': !props.isBackendConnected,
            }"
          />
        </div>
        <div
          v-if="props.showInlineStatusText && !props.isSidebarCollapsed"
          class="pl-1 pr-2 status-text-wrapper flex-grow min-w-0 flex justify-center items-center"
        >
          <div v-if="!props.isBackendConnected" class="flex items-center">
            <span class="status-orb orb-disconnected mr-1.5 flex-shrink-0"></span>
            <span class="font-medium text-sm truncate text-status-disconnected">Disconnected</span>
          </div>
          <div v-if="props.isBackendConnected" class="flex flex-col items-center">
            <div class="flex items-center">
              <span class="status-orb orb-connected mr-1.5 flex-shrink-0"></span>
              <span class="status-connected-text">Connected</span>
            </div>
            <div class="text-center -mt-1">
              <span v-if="props.formattedLatency" class="status-latency-display-text">
                Latency: {{ props.formattedLatency }}
              </span>
              <span
                v-else-if="props.latencyMs === null && props.healthCheckTimerId !== undefined"
                class="status-latency-display-text"
              >
                Calculating...
              </span>
              <span
                v-else-if="props.latencyMs === -1"
                class="status-latency-display-text text-red-500 dark:text-red-400"
              >
                Error
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles specific to Sidebar.vue */
.bg-sidebar {
  background-color: var(--sidebar-bg);
}
/* .text-sidebar-main, .text-icon-muted, etc. might not be needed here if only used in SidebarNavList now */
/* However, icons in header/footer still use them. */
.text-icon-muted {
  color: var(--icon-muted-color);
}
.group:hover .group-hover\:text-icon-accent {
  color: var(--icon-accent-color) !important;
}
.border-sidebar-border {
  border-color: var(--sidebar-border-color);
}
.text-status-connected {
  color: var(--status-connected-color);
}
.text-status-disconnected {
  color: var(--status-disconnected-color);
}

.status-orb {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
  animation:
    pulse-glow 3.2s infinite ease-in-out,
    pulse-scale 2.5s infinite ease-in-out;
}
.orb-connected {
  background-color: var(--status-connected-color);
  --orb-glow-color-start: var(--status-connected-orb-glow-start);
  --orb-glow-color-end: var(--status-connected-orb-glow-end);
}
.orb-disconnected {
  background-color: var(--status-disconnected-color);
  --orb-glow-color-start: var(--status-disconnected-orb-glow-start);
  --orb-glow-color-end: var(--status-disconnected-orb-glow-end);
}
@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 4px 0.5px var(--orb-glow-color-start);
  }
  50% {
    box-shadow: 0 0 7px 1.5px var(--orb-glow-color-end);
  }
}
@keyframes pulse-scale {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.88);
  }
}
.status-connected-text {
  font-size: 0.875rem; /* text-sm */
  line-height: 1.25rem;
  font-weight: 600; /* font-semibold */
  color: var(--status-connected-color);
}
.status-latency-display-text {
  font-size: 0.75rem; /* text-xs */
  line-height: 1rem;
  color: var(--sidebar-text-muted); /* Use a theme variable */
}
.min-w-0 {
  min-width: 0;
}
/* .truncate might not be needed here if only nav text used it */
</style>
