<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'
import { ref, watchEffect } from 'vue'

const isDark = useDark()
const toggleDark = useToggle(isDark)

const isTransitioning = ref(false)
const showContent = ref(true)
const overlayColor = ref('#ffffff')

const handleToggle = () => {
  // 步骤 1：立即隐藏内容，显示遮罩
  showContent.value = false
  isTransitioning.value = true

  // 步骤 2：设定遮罩颜色渐变
  overlayColor.value = isDark.value ? '#111827' : '#ffffff'
  requestAnimationFrame(() => {
    overlayColor.value = isDark.value ? '#ffffff' : '#111827'
  })

  // 步骤 3：提前切换主题（略早于遮罩消失）
  setTimeout(() => {
    toggleDark()
  }, 500)

  // 步骤 4：延迟恢复内容，和遮罩一起渐变淡入
  setTimeout(() => {
    isTransitioning.value = false
    showContent.value = true
  }, 800)
}

// 保证 html 上 dark class 生效
watchEffect(() => {
  document.documentElement.classList.toggle('dark', isDark.value)
})
</script>

<template>
  <div class="relative min-h-screen flex items-center justify-center overflow-hidden" style="background-color: var(--bg); color: var(--text);">
    
    <!-- 遮罩层 -->
    <div
      v-if="isTransitioning"
      class="fixed inset-0 z-50 pointer-events-none transition-colors duration-700"
      :style="{ backgroundColor: overlayColor }"
    ></div>

    <!-- 内容区域 -->
    <transition name="fade-in" appear>
      <div
        v-if="showContent"
        class="z-10 transition-opacity duration-500 flex items-center justify-center"
      >
        <button
          @click="handleToggle"
          class="px-4 py-2 border rounded transition duration-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {{ isDark ? '🌙 Dark Mode' : '☀️ Light Mode' }}
        </button>
      </div>
    </transition>
  </div>
</template>

<style>
:root {
  --bg: #ffffff;
  --text: #000000;
}
.dark {
  --bg: #111827;
  --text: #ffffff;
}

body {
  margin: 0;
  transition: background-color 0.6s ease, color 0.5s ease;
}

/* 内容区域淡入效果 */
.fade-in-enter-active {
  transition: opacity 0.2s ease;
}
.fade-in-leave-active {
  transition: opacity 0.1s ease;
}
.fade-in-enter-from,
.fade-in-leave-to {
  opacity: 0;
}
</style>
