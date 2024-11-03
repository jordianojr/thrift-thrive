<template>
  <div class="overlay" v-if="isLoading">
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';

const props = defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  },
  message: {
    type: String,
    default: 'Loading...',
  },
});
</script>

<style scoped>
.overlay {
  position: fixed; /* Make it fixed to cover the viewport */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white; /* Semi-transparent background */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999; /* Ensure it's above other content */
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column; /* Stack the spinner and text vertically */
}

.loading-spinner {
  border: 8px solid #f3f3f3; /* Light grey */
  border-top: 8px solid black; /* Blue */
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 15px;
  font-size: 16px;
  color: #000; /* Change to white for better contrast on dark background */
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
