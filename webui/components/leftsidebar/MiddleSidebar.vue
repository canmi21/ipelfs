<template>
  <div class="middle-section">
    <ul>
      <li>Home</li>
      <li>Activity</li>
      <li>Collections</li>
      <li>Volumes</li>
    </ul>
  </div>
</template>

<script lang="ts">
export default {
  name: 'MiddleSection',
}
</script>

<style scoped>
.middle-section {
  flex-grow: 1;
  padding: 1rem;
  background-color: #ffffff;
  overflow-y: auto;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  padding: 10px 0;
  cursor: pointer;
}
</style>
