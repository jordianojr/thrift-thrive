<template>
  <div class="success-container text-center">
    <h2 class="text-black mb-4">Payment Successful!</h2>
    <p class="text-black mb-4">Thank you for your purchase.</p>
    <router-link to="/marketplace" class="btn btn-success">
      Continue Shopping
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useCartStore } from '@/stores/cartStore';
import { useRouter } from 'vue-router';

const router = useRouter();
const voucherId = router.currentRoute.value.params.voucher as string;
const itemId = router.currentRoute.value.params.itemId as string;
const cartStore = useCartStore();

onMounted(() => {
  console.log('Voucher ID:', voucherId);
  console.log('Item ID:', itemId);
  cartStore.clearCart();
});
</script>

<style scoped>
.success-container {
  padding: 40px;
  margin-top: 40px;
}
</style>
