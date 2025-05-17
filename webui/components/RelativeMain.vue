<!-- components/RelativeMain.vue -->

<template>
  <div class="relative-main-content-wrapper">
    <TopRightActions class="actions-toolbar-position" />
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TopRightActions from './relativemain/TopRightActions.vue'

export default defineComponent({
  name: 'RelativeMain',
  components: {
    TopRightActions,
  },
})
</script>

<style scoped>
.relative-main-content-wrapper {
  height: 100%;
  position: relative;
  padding: 1rem;
}

.actions-toolbar-position {
  position: absolute;
  top: 0rem;
  right: 0.75rem;
  z-index: 10;
}
</style>
