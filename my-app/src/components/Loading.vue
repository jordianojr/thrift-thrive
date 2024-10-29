<template>
    <div class="loading-container" v-if="isLoading">
      <div class="loading-spinner"></div>
      <p style="color: white" class="loading-text">{{ message }}</p>
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
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 50px; /* Adjust as needed */
}
  
  .loading-spinner {
    border: 8px solid #f3f3f3; /* Light grey */
    border-top: 8px solid #3498db; /* Blue */
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
  }
  
  .loading-text {
    margin-top: 15px;
    font-size: 16px;
    color: #333;
    margin-left: 20px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  </style>
  