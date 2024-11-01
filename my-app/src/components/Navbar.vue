<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
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
          <router-link class="nav-link nav-elegant mx-2" to="/cart">
            <i class="bi bi-cart"></i> Cart
          </router-link>
          <router-link class="nav-link nav-elegant mx-2" to="/chat">
            <i class="bi bi-chat"></i> Chat
          </router-link>
          <a class="nav-link nav-elegant mx-2" href="#" @click.prevent="handleLogout">
            <i class="bi bi-box-arrow-right"></i> Log out
          </a>
          <router-link class="nav-link nav-elegant mx-2" to="/profile">
            <i class="bi bi-person-gear custom-icon"></i>
          </router-link>
          <router-link class="nav-link mx-2" to="/sell">
            <button class="btn btn-outline-elegant text-uppercase px-4 py-2 border-2 rounded-pill">
              Sell
            </button>
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { defineEmits } from 'vue';
import { auth } from '../lib/firebaseConfig';
import { signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';

const emit = defineEmits(['select']);
const router = useRouter();

const select = (item: string) => {
  emit('select', item);
};

const handleLogout = async () => {
  try {
    await signOut(auth);
    localStorage.clear();
    router.push({ name: 'login' });
  } catch (error) {
    console.error("Logout error:", error);
  }
};
</script>

<style scoped>
.nav-elegant {
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-size: 85%;
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