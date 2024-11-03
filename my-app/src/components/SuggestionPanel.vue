<template>
<div class="row">
  <div class="col-sm-6 mb-3 mb-sm-0">
    <div class="card p-2">
      <div class="card-body">
        <h5 class="card-title">More of a touchy buyer?</h5>
        <p class="card-text">Check out upcoming thrift events in Singapore!</p>
        <a href="/thrift-stores" class="btn btn-outline-elegant text-uppercase px-4 py-2 ">Thrift Events</a>
      </div>
    </div>
  </div>
  <div class="col-sm-6">
    <div class="card p-2">
      <div class="card-body">
        <h5 class="card-title">Ready to check out?</h5>
        <p class="card-text">You can now pay with ApplePay!</p>
        <a href="#" class="btn btn-outline-elegant text-uppercase px-4 py-2 " @click="">Cart</a>
      </div>
    </div>
  </div>
</div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

  const router = useRouter();
  const navigateToCart = () => {
    router.push({ name: 'cart' });
};
</script>

<style scoped>

.btn-outline-elegant {
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 500;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  border-color: currentColor;
  font-size: 85%;
}

.btn-outline-elegant:hover {
  color: green;
  transform: scale(1.05);
}

.card-title {
  font-weight: 400;
  text-transform: uppercase;
  color: black;
  font-size: 1.2rem;
}

.card-text {
  font-family: 'Helvetica Neue', sans-serif;
  color: black;
  font-size: 0.875rem;
  font-weight: 300;
}
</style>