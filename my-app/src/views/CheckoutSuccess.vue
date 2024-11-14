<template>
  <div class="success-container text-center">
    <h2 class="text-black mb-4">Payment Successful!</h2>
    <p class="text-black mb-4">Thank you for your purchase.</p>
    <router-link to="/marketplace" class="btn btn-success">
      Continue Shopping {{ voucherId }} {{ itemId }}
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useCartStore } from '@/stores/cartStore';
import { useRoute } from 'vue-router';

const route = useRoute();
const voucherId = route.params.voucherId as string | undefined;
const itemId = route.params.itemId as string;
const cartStore = useCartStore();

onMounted(() => {
  console.log('Voucher ID:', voucherId);
  console.log('Item ID:', itemId);
  console.log('Route params:', route.params);
  cartStore.clearCart();
});

</script>

<style scoped>
.success-container {
  padding: 40px;
  margin-top: 40px;
}
</style>
