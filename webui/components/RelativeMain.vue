<!-- components/RelativeMain.vue -->

<template>
  <div class="relative-main-content-wrapper">
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
export default {
  name: 'RelativeMain',
}
</script>

<style scoped>
@import '../assets/app/relativemain_component.css'; /* Assuming a new CSS for component-specific styles if needed beyond layout */

.relative-main-content-wrapper {
  height: 100%;
}
</style>
