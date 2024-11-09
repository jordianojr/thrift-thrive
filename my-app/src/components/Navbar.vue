<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary border-bottom border-secondary">
    <div class="container-fluid">
      <router-link class="navbar-brand mx-3" to="/">Thrive</router-link>
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNavAltMarkup" 
        aria-controls="navbarNavAltMarkup" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div class="navbar-nav me-auto">
          <router-link class="nav-link nav-elegant mx-2" to="/marketplace">
            <i class="bi bi-shop"></i> Marketplace
          </router-link>
          <router-link class="nav-link nav-elegant mx-2" to="/thrift-stores">
            <i class="bi bi-bag"></i> Thrift Stores
          </router-link>
          <router-link class="nav-link nav-elegant mx-2" to="/editorial">
            <i class="bi bi-pencil"></i> Editorial
          </router-link>
        </div>

        <div class="navbar-nav">
          <router-link class="nav-link nav-elegant mx-2" to="/sell">
            <i class="bi bi-box-seam"></i> Sell
          </router-link>
          <!-- <router-link class="nav-link nav-elegant mx-2" to="/cart">
            <i class="bi bi-cart"></i> Cart
          </router-link> -->
          <router-link class="nav-link nav-elegant mx-2" to="/chat">
            <i class="bi bi-chat"></i> Chat
          </router-link>
          <router-link class="nav-link nav-elegant mx-2" to="/login" @click.prevent="handleLogout">
            <i class="bi bi-box-arrow-right"></i> Log out
          </router-link>
          <router-link class="nav-link nav-elegant mx-2" to="/profile">
            <i class="bi bi-person-gear custom-icon"></i>
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { auth } from '../lib/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';

const router = useRouter();

async function animateBrand() {
  gsap.to(".navbar-brand", { 
    duration: 5,
    color: '#ffffff',
    repeat: -1,
    yoyo: true,
    ease: "power1.in",
    scale: 1.1
  });
}

const handleLogout = async () => {
  try {
    await signOut(auth);
    localStorage.clear();
    router.push({ name: 'login' });
  } catch (error) {
    console.error("Logout error:", error);
  }
};

onMounted(() => {
  animateBrand();
});
</script>

<style scoped>
.nav-elegant {
  transition: all 0.3s ease;
  font-size: 85%;
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 500;
  text-transform: uppercase;
  text-align: center;
  font-size: 0.8rem;
  color: black;
}

.nav-elegant:hover {
  color: green;
  transform: scale(1.05);
}

.navbar-brand {
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-size: 200%;
}

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
  background-color: transparent;
}

.custom-icon {
  font-size: 1.5rem;
  line-height: 1;
  vertical-align: middle;
}

.navbar-nav {
  display: flex;
  align-items: center;
  height: 100%;
}

/* Preserve spacing between nav items */
.mx-2 {
  margin-left: 0.5rem !important;
  margin-right: 0.5rem !important;
}
</style>