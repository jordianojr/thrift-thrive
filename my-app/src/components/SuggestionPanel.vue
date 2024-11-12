<template>
<div class="row">
  <div class="col-sm-6 mb-3 mb-sm-0">
    <div class="card p-2">
      <div class="card-body">
        <h5 class="card-title">More of a touchy buyer?</h5>
        <p class="card-text">Check out upcoming thrift events in Singapore</p>
        <a href="/thrift-stores" class="btn btn-outline-elegant text-uppercase px-4 py-2 ">Thrift Events</a>
      </div>
    </div>
  </div>
  <div class="col-sm-6">
    <div class="card p-2">
      <div class="card-body">
        <h5 class="card-title">Need some inspiration?</h5>
        <p class="card-text">Explore our fashion editorial</p>
        <a href="/editorial" class="btn btn-outline-elegant text-uppercase px-4 py-2 ">Editorial</a>
      </div>
    </div>
  </div>
</div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

  const router = useRouter();
</script>

<style scoped>

.btn-outline-elegant {
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 500;
  background-color: black !important;
  letter-spacing: 1px;
  color: white !important;
  transition: all 0.3s ease;
  text-transform: uppercase;
  text-align: center;
  font-size: 0.875rem !important;
  border: black 1px solid !important;
  cursor: pointer;
  width: 60%;
  padding-top: 7px;
  padding-bottom:7px;
}

.btn-outline-elegant:hover {
  color: black !important;
  background-color: white !important;
  border: black 1px solid !important;
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