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
/* @import '../assets/app/relativemain_component.css'; */ /* If this file exists and styles .relative-main-content-wrapper */

.relative-main-content-wrapper {
  height: 100%;
  position: relative; /* For absolute positioning of children */
  /* Ensure this wrapper has the padding if the actions toolbar should respect it.
     If App.vue's .relative-main already has padding, and this should be flush to that,
     then this wrapper might not need its own padding.
     For now, assuming the positioning is relative to this wrapper's edges. */
  padding: 1rem; /* This is the padding of the main content area */
}

.actions-toolbar-position {
  position: absolute;
  /* The center of the first (rightmost) 1.5rem icon should be 1.5rem from top/right.
     The TopRightActions container is 3rem high.
     So, top of TopRightActions = 1.5rem (target center) - 1.5rem (half container height) = 0rem
     The rightmost slot (3rem wide) contains the 1.5rem icon centered.
     So, right of TopRightActions = 1.5rem (target center) - 1.5rem (half slot width) = 0rem
     These 0rem values are relative to the padding of .relative-main-content-wrapper.
  */
  top: 0rem; /* Positioned at the top of the padded area */
  right: 0rem; /* Positioned at the right of the padded area */
  z-index: 10;
}
</style>
