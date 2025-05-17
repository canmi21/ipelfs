// webui/App.vue
<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

// Composables
import { useTheme } from './composables/useTheme'
import { useSidebar } from './composables/useSidebar'
import { useBackendStatus } from './composables/useBackendStatus'
import { useBrowserCompatibility } from './composables/useBrowserCompatibility'
import { useJavascriptErrorHandler } from './composables/useJavascriptErrorHandler'
import { useGlobalSwitches, type SwitchConfig } from './composables/useGlobalSwitches'

// Utils
import { openExternalLink, refreshPage } from './utils/browser'

// Components
import SwitchContainer from './components/SwitchContainer.vue'
import SidebarComponent from './components/LeftSidebar.vue'
import ConnectionLostModal from './components/ConnectionLostModal.vue'
import JavascriptErrorModal from './components/JavascriptErrorModal.vue'
import NotificationContainer from './components/NotificationContainer.vue'

// Icons for Theme Switch
import { Sun, Moon, SunMoon } from 'lucide-vue-next'

// --- Initialize Composables ---
const themeManager = useTheme()
const switchManager = useGlobalSwitches()
const mainContentEl = ref<HTMLElement | null>(null)
const sidebarManager = useSidebar(mainContentEl)
const backendStatusManager = useBackendStatus()
const jsErrorHandler = useJavascriptErrorHandler()
useBrowserCompatibility()

// --- Theme Switch Registration ---
const themeSwitchConfig = computed(
  (): SwitchConfig => ({
    id: 'theme-switch',
    order: 0,
    states: [
      {
        value: 'light',
        iconComponent: Sun,
        title: 'Switch to Light Theme',
      },
      {
        value: 'dark',
        iconComponent: Moon,
        title: 'Switch to Dark Theme',
      },
      {
        value: 'system',
        iconComponent: SunMoon,
        title: 'Use System Preference',
      },
    ],
    currentStateValue: themeManager.currentTheme.value,
    onToggle: () => themeManager.handleToggle(),
  }),
)

watch(
  themeSwitchConfig,
  (newConfig) => {
    switchManager.registerSwitch(newConfig)
  },
  { immediate: true, deep: true },
)

onUnmounted(() => {
  switchManager.unregisterSwitch('theme-switch')
})

const handleRetryConnection = () => {
  backendStatusManager.triggerManualHealthCheck()
}

const openRepositoryIssuesPage = () => {
  openExternalLink('https://github.com/canmi21/ipelfs/issues')
}

const handleOpenExternalLink = (url: string) => {
  openExternalLink(url)
}
</script>

<template>
  <div
    class="relative min-h-screen"
    :style="{ backgroundColor: 'var(--bg-main-content)', color: 'var(--text-main-color)' }"
  >
    <SidebarComponent
      :is-sidebar-collapsed="sidebarManager.isSidebarCollapsed.value"
      :show-sidebar-text="sidebarManager.showSidebarText.value"
      :show-github-icon="sidebarManager.showGithubIconInSidebar.value"
      :show-inline-status-text="sidebarManager.showInlineStatusTextInSidebar.value"
      :sidebar-width-class="sidebarManager.sidebarWidthClass.value"
      :is-backend-connected="backendStatusManager.isBackendConnected.value"
      :formatted-latency="backendStatusManager.formattedLatency.value"
      :latency-ms="backendStatusManager.latencyMs.value"
      :health-check-timer-id="backendStatusManager.healthCheckTimerId.value"
      @toggle-sidebar="sidebarManager.handleSidebarToggle"
      @open-external-link="handleOpenExternalLink"
    />

    <SwitchContainer />
    <NotificationContainer />

    <div
      ref="mainContentEl"
      :class="sidebarManager.contentMarginClass.value"
      class="relative z-20 transition-margin min-h-screen overflow-y-auto"
      :style="{ backgroundColor: 'var(--bg-main-content)' }"
    >
      <router-view v-slot="{ Component }">
        <transition name="fade-router" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <ConnectionLostModal
      :is-backend-connected="backendStatusManager.isBackendConnected.value"
      :is-retrying-manual-check="backendStatusManager.isRetryingManualCheck.value"
      :trigger-shake="backendStatusManager.triggerShake.value"
      :show-retry-failure-icon="backendStatusManager.showRetryFailureIcon.value"
      @retry-connection="handleRetryConnection"
      @open-issues-page="openRepositoryIssuesPage"
      v-if="!jsErrorHandler.showJavascriptErrorOverlay.value"
    />
    <JavascriptErrorModal
      :show-overlay="jsErrorHandler.showJavascriptErrorOverlay.value"
      :help-link="jsErrorHandler.jsErrorHelpLink"
      @refresh-page="refreshPage"
      @open-external-link="handleOpenExternalLink"
    />
  </div>
</template>

<style>
/* Global styles should be in main.css */
</style>
