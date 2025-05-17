<template>
  <div class="sidebar-internal-layout">
    <TopSidebar />
    <MiddleSidebar />
    <BottomSidebar />
  </div>
</template>

<script lang="ts">
import TopSidebar from './leftsidebar/TopSidebar.vue'
import MiddleSidebar from './leftsidebar/MiddleSidebar.vue'
import BottomSidebar from './leftsidebar/BottomSidebar.vue'

export default {
  name: 'LeftSidebar',
  components: {
    TopSidebar,
    MiddleSidebar,
    BottomSidebar,
  },
}
</script>

<style scoped>
.sidebar-internal-layout {
  display: flex; /* Establishes this div as a flex container. */
  flex-direction: column; /* Arranges its children (Top, Middle, Bottom) vertically. */
  height: 100%; /* Crucial: Makes this div take up the full height of its parent's (App.vue .left-sidebar div) content box. */
  width: 100%; /* Makes this div take up the full width of its parent's content box. */
  /* This container itself will be *inside* the padding defined in 'assets/app/leftsidebar.css'. */
  /* It does not need its own padding or background unless specifically desired for an inner layer. */
}
</style>
