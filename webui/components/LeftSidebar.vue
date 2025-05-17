<template>
  <div class="left-sidebar">
    <TopSection />
    <MiddleSection />
    <BottomSection />
  </div>
</template>

<script lang="ts">
import TopSection from './leftsidebar/TopSidebar.vue'
import MiddleSection from './leftsidebar/MiddleSidebar.vue'
import BottomSection from './leftsidebar/BottomSidebar.vue'

export default {
  name: 'LeftSidebar',
  components: {
    TopSection,
    MiddleSection,
    BottomSection,
  },
}
</script>

<style scoped>
.left-sidebar {
  width: 16rem;
  height: 100vh;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}
</style>
