<script setup lang="ts">
import PhaserContainer from '@/components/PhaserContainer.vue';
</script>

<template>
  <Suspense>
    <PhaserContainer />

    <template #fallback>
      <div class="placeholder">
        Downloading ...
      </div>
    </template>
  </Suspense>
</template>

<style lang="scss" scoped>
.placeholder {
  font-size: 2rem;
  font-family: 'Courier New', Courier, monospace;
  background-color: white;
  margin: auto;
  position: fixed;
  top: 0;
  left: 0;
}
</style>
