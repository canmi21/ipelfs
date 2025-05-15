<script setup lang="ts">
import { ref } from 'vue'

import { useSidebar } from './composables/useSidebar'
import { useBackendStatus } from './composables/useBackendStatus'
import { useJavascriptErrorHandler } from './composables/useJavascriptErrorHandler'

import ThemeToggle from './components/ThemeToggle.vue'
import SidebarComponent from './components/LeftSidebar.vue' // Renamed to avoid conflict with composable
import ConnectionLostModal from './components/ConnectionLostModal.vue'
import JavascriptErrorModal from './components/JavascriptErrorModal.vue'

import { openExternalLink, refreshPage } from './utils/browser'

// --- Theme (from composable) ---
// isDark is implicitly handled by useTheme via document.documentElement.classList
// const { handleToggle: handleThemeToggle, currentIcon: themeIcon } = useTheme() // Already imported by ThemeToggle.vue

// --- Main Content Element Ref for Sidebar ---
const mainContentEl = ref<HTMLElement | null>(null)

// --- Sidebar (from composable) ---
const {
  isSidebarCollapsed,
  showSidebarText,
  showGithubIconInSidebar,
  showInlineStatusTextInSidebar,
  sidebarWidthClass,
  contentMarginClass,
  // isAnimating, // Not directly needed in App.vue template
  handleSidebarToggle,
} = useSidebar(mainContentEl)

// --- Backend Status (from composable) ---
const {
  isBackendConnected,
  latencyMs,
  formattedLatency,
  healthCheckTimerId,
  triggerManualHealthCheck,
  isRetryingManualCheck,
  triggerShake,
  showRetryFailureIcon,
} = useBackendStatus(/* you can pass healthCheckUrl here if it's dynamic */)

// --- JavaScript Error Handling (from composable) ---
const { showJavascriptErrorOverlay, jsErrorHelpLink } = useJavascriptErrorHandler()

// --- Event Handlers for Modals ---
const handleRetryConnection = () => {
  triggerManualHealthCheck()
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
      :is-sidebar-collapsed="isSidebarCollapsed"
      :show-sidebar-text="showSidebarText"
      :show-github-icon="showGithubIconInSidebar"
      :show-inline-status-text="showInlineStatusTextInSidebar"
      :sidebar-width-class="sidebarWidthClass"
      :is-backend-connected="isBackendConnected"
      :formatted-latency="formattedLatency"
      :latency-ms="latencyMs"
      :health-check-timer-id="healthCheckTimerId"
      @toggle-sidebar="handleSidebarToggle"
      @open-external-link="handleOpenExternalLink"
    />

    <ThemeToggle />

    <div
      ref="mainContentEl"
      :class="contentMarginClass"
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
      :is-backend-connected="isBackendConnected"
      :is-retrying-manual-check="isRetryingManualCheck"
      :trigger-shake="triggerShake"
      :show-retry-failure-icon="showRetryFailureIcon"
      @retry-connection="handleRetryConnection"
      @open-issues-page="openRepositoryIssuesPage"
      v-if="!showJavascriptErrorOverlay"
    />
    <JavascriptErrorModal
      :show-overlay="showJavascriptErrorOverlay"
      :help-link="jsErrorHelpLink"
      @refresh-page="refreshPage"
      @open-external-link="handleOpenExternalLink"
    />
  </div>
</template>

<style>
/*
  The <style> block from the original App.vue, which contained :root, .dark, body,
  and global utility animation classes, should be MOVED to 'webui/assets/main.css'.
  Then, import 'webui/assets/main.css' in your 'webui/main.ts' file.

  Example in main.ts:
  import './assets/main.css'

  This App.vue should ideally have NO <style> block or only very specific,
  non-global styles if absolutely necessary. Keeping it clean.
*/
/*
  If you have styles that are truly specific only to the App.vue layout shell itself,
  and not to any component or globally, they could go here with <style scoped>.
  However, based on your original file, most of it was global.
*/
</style>
