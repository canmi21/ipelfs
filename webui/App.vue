<template>
  <div class="container mx-auto p-4">
    <router-view></router-view>
    <!-- 渲染匹配到的组件 -->
  </div>
</template>

<script lang="ts">
export default {
  name: 'App',
}
</script>

<style scoped>
/* 可以在这里加入一些全局样式 */
</style>
