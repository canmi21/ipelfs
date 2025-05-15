import { ref, watchEffect, nextTick, onUnmounted, type Ref } from 'vue'

export function useSidebar(mainContentEl: Ref<HTMLElement | null>) {
  const getInitialSidebarState = (): boolean => {
    const storedState = localStorage.getItem('sidebarCollapsed')
    if (storedState !== null) {
      try {
        return JSON.parse(storedState)
      } catch (e) {
        console.error(
          'Failed to parse sidebarCollapsed from localStorage. Defaulting to expanded.',
          e,
        )
        return false
      }
    }
    return false // Default to expanded
  }

  const isSidebarCollapsed = ref(getInitialSidebarState())
  const showSidebarText = ref(!isSidebarCollapsed.value) // Text inside sidebar items
  const showGithubIconInSidebar = ref(!isSidebarCollapsed.value) // Github icon in sidebar header
  const showInlineStatusTextInSidebar = ref(!isSidebarCollapsed.value) // Connection status text in sidebar footer

  const sidebarWidthClass = ref(isSidebarCollapsed.value ? 'w-14' : 'w-56')
  const contentMarginClass = ref(isSidebarCollapsed.value ? 'ml-14' : 'ml-56')
  const isAnimating = ref(false)

  // Timers for staggered appearance/disappearance
  const githubIconCollapseTimer = ref<number | undefined>(undefined)
  const githubIconExpandTimer = ref<number | undefined>(undefined)
  const statusTextExpandTimer = ref<number | undefined>(undefined)

  watchEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed.value))
  })

  const handleSidebarToggle = () => {
    if (isAnimating.value) return
    isAnimating.value = true

    // Clear any pending timers
    if (githubIconCollapseTimer.value !== undefined) clearTimeout(githubIconCollapseTimer.value)
    if (githubIconExpandTimer.value !== undefined) clearTimeout(githubIconExpandTimer.value)
    if (statusTextExpandTimer.value !== undefined) clearTimeout(statusTextExpandTimer.value)
    githubIconCollapseTimer.value = undefined
    githubIconExpandTimer.value = undefined
    statusTextExpandTimer.value = undefined

    const currentlyCollapsed = isSidebarCollapsed.value
    const animationDuration = 300 // ms, should match CSS transition duration
    const expandShowEarlyMs = 50 // How much earlier to start showing text/icons on expand

    if (!currentlyCollapsed) {
      // Collapse action
      isSidebarCollapsed.value = true
      showGithubIconInSidebar.value = false // Hide immediately or with a very short delay
      showInlineStatusTextInSidebar.value = false // Hide immediately or with a very short delay

      // General text in sidebar items might need a slightly longer delay to hide
      // to prevent text overflow during width transition.
      const generalTextHideDelay = Math.max(50, animationDuration - 150) // Adjust as needed
      setTimeout(() => {
        if (isSidebarCollapsed.value) {
          // Check again in case of rapid toggles
          showSidebarText.value = false
        }
      }, generalTextHideDelay)

      nextTick(() => {
        // Ensure DOM updates for collapse are queued
        sidebarWidthClass.value = 'w-14'
        contentMarginClass.value = 'ml-14'
      })

      // Animation end handling
      const onCollapseAnimationEnd = () => {
        isAnimating.value = false
      }
      // Listen on the main content margin transition or sidebar width transition
      if (mainContentEl.value) {
        mainContentEl.value.addEventListener('transitionend', onCollapseAnimationEnd, {
          once: true,
        })
      } else {
        // Fallback if mainContentEl is not available (should not happen in normal flow)
        setTimeout(onCollapseAnimationEnd, animationDuration + 50) // Add buffer
      }
    } else {
      // Expand action
      isSidebarCollapsed.value = false
      // Set sidebar width first, then animate margin and show text
      sidebarWidthClass.value = 'w-56' // Expand sidebar width

      nextTick(() => {
        // Ensure DOM updates for expand are queued
        contentMarginClass.value = 'ml-56' // Expand content margin

        // Schedule text/icons to appear towards the end of the animation
        const baseTextShowTime = Math.max(0, animationDuration - expandShowEarlyMs - 50)
        setTimeout(() => {
          if (!isSidebarCollapsed.value) showSidebarText.value = true
        }, baseTextShowTime)

        const showIconTime = Math.max(0, animationDuration - expandShowEarlyMs)
        githubIconExpandTimer.value = window.setTimeout(() => {
          if (!isSidebarCollapsed.value) showGithubIconInSidebar.value = true
        }, showIconTime)

        const showStatusTextTime = Math.max(0, animationDuration - expandShowEarlyMs + 20) // Slightly after icons
        statusTextExpandTimer.value = window.setTimeout(() => {
          if (!isSidebarCollapsed.value) showInlineStatusTextInSidebar.value = true
        }, showStatusTextTime)
      })

      // Animation end handling
      const onExpandAnimationEnd = () => {
        // Ensure all elements are visible if they weren't by timers
        if (!isSidebarCollapsed.value) {
          if (!showGithubIconInSidebar.value) showGithubIconInSidebar.value = true
          if (!showInlineStatusTextInSidebar.value) showInlineStatusTextInSidebar.value = true
          if (!showSidebarText.value) showSidebarText.value = true
        }
        isAnimating.value = false
      }
      if (mainContentEl.value) {
        mainContentEl.value.addEventListener('transitionend', onExpandAnimationEnd, { once: true })
      } else {
        setTimeout(onExpandAnimationEnd, animationDuration + 50)
      }
    }
  }

  onUnmounted(() => {
    if (githubIconCollapseTimer.value !== undefined) clearTimeout(githubIconCollapseTimer.value)
    if (githubIconExpandTimer.value !== undefined) clearTimeout(githubIconExpandTimer.value)
    if (statusTextExpandTimer.value !== undefined) clearTimeout(statusTextExpandTimer.value)
    // Note: Transitionend listeners on mainContentEl are {once: true}, so they clean themselves up.
  })

  return {
    isSidebarCollapsed,
    showSidebarText,
    showGithubIconInSidebar,
    showInlineStatusTextInSidebar,
    sidebarWidthClass,
    contentMarginClass,
    isAnimating,
    handleSidebarToggle,
  }
}
