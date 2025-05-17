<template>
  <div class="flex h-screen">
    <div class="left-sidebar">
      <LeftSidebar />
    </div>
    <div class="relative-main">
      <RelativeMain />
    </div>
  </div>
</template>

<script lang="ts">
import LeftSidebar from './components/LeftSidebar.vue'
import RelativeMain from './components/RelativeMain.vue'

export default {
  name: 'App',
  components: {
    LeftSidebar,
    RelativeMain,
  },
  mounted() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark')
    }
  },
}
</script>

<style>
@import './assets/app/leftsidebar.css';
@import './assets/app/relativemain.css';

.flex {
  display: flex;
}

.h-screen {
  height: 100vh;
}

.left-sidebar {
  flex: 0 0 16rem;
}

.relative-main {
  flex: 1;
}

@media (min-width: 640px) {
  .flex {
    display: flex;
  }
}
</style>
