<!-- components/LeftSidebar.vue -->

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
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}
</style>
