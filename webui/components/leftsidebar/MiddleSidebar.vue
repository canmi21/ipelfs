<!-- components/leftsidebar/MiddleSidebar.vue -->

<template>
  <div class="middle-sidebar">
    <ul v-show="!isParentCollapsed">
      <li>Home</li>
      <li>Activity</li>
      <li>Collections</li>
      <li>Volumes</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MiddleSidebar',
  props: {
    isParentCollapsed: {
      type: Boolean,
      required: true,
    },
  },
})
</script>

<style scoped>
@import '../../assets/app/leftsidebar/middlesidebar.css';

.middle-sidebar {
  flex-grow: 1;
  overflow-y: auto; /* Applied when content is visible and overflows */
  min-height: 0; /* Allows the element to shrink to 0 height if content is hidden and no other constraints */
  /* This ensures it can still grow to fill space due to flex-grow: 1 */
}
</style>
