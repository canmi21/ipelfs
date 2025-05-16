<script setup lang="ts">
import { useNotifications } from './../composables/useNotifications'
import NotificationItem from './NotificationItem.vue'

const { notifications, dismissNotification } = useNotifications()

const handleDismiss = (id: string) => {
  dismissNotification(id, true)
}
</script>

<template>
  <div
    aria-live="assertive"
    class="fixed inset-0 flex flex-col items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-end z-[9999]"
  >
    <TransitionGroup name="list" tag="div" class="w-full max-w-sm">
      <NotificationItem
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
        @dismiss="handleDismiss"
        class="w-full"
      />
    </TransitionGroup>
  </div>
</template>

<style scoped>
/*
// @import './../assets/notification.css';

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-move {
  transition: transform 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-leave-active {
  position: absolute;
  width: 100%; // 确保宽度在离开动画时保持，避免影响其他元素布局
}
*/
</style>
