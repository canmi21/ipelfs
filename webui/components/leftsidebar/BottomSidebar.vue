<template>
  <div class="bottom-section">
    <div class="settings">
      <button>Settings</button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'BottomSection',
}
</script>

<style scoped>
.bottom-section {
  padding: 1rem;
  background-color: #f9f9f9;
  border-top: 1px solid #ddd;
}
.settings button {
  padding: 0.5rem 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
