<template>
    <div 
      class="progress-bar" 
      :style="{ 
        opacity: loading ? '1' : '0',
        width: `${progress}%`
      }"
    ></div>
</template>
  
  <script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const loading = ref(false);
  const progress = ref(0);
  let progressInterval: number | null = null;
  
  const startLoading = () => {
    loading.value = true;
    progress.value = 0;
    progressInterval = setInterval(() => {
      if (progress.value < 90) {
        progress.value += Math.random() * 10;
      }
    }, 200) as unknown as number;
  };
  
  const finishLoading = () => {
    progress.value = 100;
    setTimeout(() => {
      loading.value = false;
      progress.value = 0;
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
    }, 200);
  };
  
  // Watch for route changes
  router.beforeEach((to, from, next) => {
    startLoading();
    next();
  });
  
  router.afterEach(() => {
    finishLoading();
  });
  </script>
  
  <style scoped>
  .progress-bar {
    position: fixed;
    top: 0%; /* Adjust this value based on your navbar height */
    left: 0;
    height: 3px;
    background: linear-gradient(to right, #4CAF50, #45a049);
    transition: width 0.2s ease-in-out, opacity 0.3s ease-in-out;
    z-index: 1001;
  }
  </style>