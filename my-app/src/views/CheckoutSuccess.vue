<template>
  <div class="success-container text-center">
    <h2 class="text-white mb-4">Payment Successful!</h2>
    <p class="text-white mb-4">Thank you for your purchase.</p>
    <router-link to="/marketplace" class="btn btn-success">
      Continue Shopping
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useCartStore } from '@/stores/cartStore';

const cartStore = useCartStore();

onMounted(() => {
  cartStore.clearCart();
});
</script>

<style scoped>
.success-container {
  padding: 40px;
  margin-top: 40px;
}
</style>
