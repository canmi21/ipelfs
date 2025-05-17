<!-- components/leftsidebar/topsidebar/SidebarToggleButton.vue -->

<template>
  <button class="sidebar-toggle-button" @click="handleClick">&lt;</button>
</template>

<script lang="ts">
export default {
  name: 'SidebarToggleButton',
  emits: ['toggle'],
  methods: {
    handleClick() {
      this.$emit('toggle')
    },
  },
}
</script>

<style scoped>
@import '../../../assets/app/leftsidebar/topsidebar/sidebartogglebutton.css';

.sidebar-toggle-button {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
