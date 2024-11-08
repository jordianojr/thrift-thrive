<template>
  <div>    
    <div v-if="!isLoggedIn">
      <h2 class="header">Login</h2>
      <form class="row flex-center flex" @submit.prevent="handleLogin">
        <div class="form-widget">
          <div>
            <input
              style="background-color: white !important;"
              class="inputField"
              required
              type="email"
              placeholder="Email"
              v-model="email"
            />
          </div>
          <div>
            <input
              class="inputField"
              required
              type="password"
              placeholder="Password"
              v-model="password"
            />
          </div>
          <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
          <div>
            <button
              v-if="!loading && !isLoggedIn"
              type="submit"
              class="btn submit-btn py-2"
            >
            Sign in!
            </button>
            <router-link
              v-else-if="isLoggedIn"
              class="btn submit-btn py-2"
              :to="{ name: 'home' }"
            >
              Go to Home
            </router-link>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { auth } from '../lib/firebaseConfig'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'vue-router'

const loading = ref(false)
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoggedIn = ref(false) // Track login state
const router = useRouter()

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    isLoggedIn.value = !!user // Set to true if user is logged in
  });
});

const handleLogin = async () => {
  try {
    loading.value = true
    errorMessage.value = '' // Clear previous error messages
    await signInWithEmailAndPassword(auth, email.value, password.value)
    isLoggedIn.value = true // Set login state to true
    router.push({ name: 'home' }); // Redirect to home page after login
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message // Display error message
    }
  } finally {
    loading.value = false
  }
}
</script>

<style>
.inputField {
  width: 100%;
  height: 35px;
  padding: 12px;
  font-size: 16px;
  border: none;
  border-bottom: 0.5px solid #000;
  border-radius: 0;
  margin: 5px 0;
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 400;
  color: black;
}

.inputField:focus {
  outline: none;
  border-bottom: 1px solid green;
}

.submit-btn {
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 500;
  background-color: black !important;
  letter-spacing: 1px;
  color: white !important;
  transition: all 0.3s ease;
  text-transform: uppercase;
  width: 100%;
  margin-top: 20px;
  text-align: center;
  font-size: 0.875rem !important;
  border: black 1px solid !important;
  cursor: pointer;
}

.submit-btn:hover {
  color: black !important;
  background-color: white !important;
  border: black 1px solid !important;
}

.error {
  color: red; /* Style for error message */
  margin-top: 10px;
}

.header{
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 1.2rem !important;
  color: black;
}


</style>
