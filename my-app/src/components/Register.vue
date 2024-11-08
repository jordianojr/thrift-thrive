<template>
  <div>
    <h2 class="header">Register</h2>
    <form class="row flex-center flex" @submit.prevent="handleRegister">
      <div class="form-widget">
        <div>
          <input
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
        <div v-if="statusMessage" class="error">{{ statusMessage }}</div>
        <div>
          <input
            type="submit"
            class="btn submit-btn py-2"
            :value="loading ? 'Loading' : 'Register'"
            :disabled="loading"
          />
        </div>
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { auth, db } from '../lib/firebaseConfig' // Ensure you have the Firestore db imported
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router' // Import useRouter

const router = useRouter()
const loading = ref(false)
const email = ref('')
const password = ref('')
const statusMessage = ref('')

const handleRegister = async () => {
  try {
    loading.value = true
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user

    // Create a document in Firestore for the new user
    const userData = {
      email: user.email,
      username: '', // Get the username from the input
      photoURL: '', // You can leave this empty or set a default
      orderHistory: [], // Initialize an empty order history
      rating: 0, // Initialize the rating to 0
      reviews: [], // Initialize an empty reviews array
      role: 'user', // Set the role to 'user'
      likedItems: [], // Initialize an empty liked items array
    }
    alert("Registration is successful!");
    router.push('/home');
    await setDoc(doc(db, 'users', user.uid), userData) // Assuming 'users' is your collection name
 // Redirect to home
    email.value = ''
    password.value = ''

  } catch (error) {
    if (error instanceof Error) {
      statusMessage.value = error.message; // Set error message to display
    } else {
      statusMessage.value = 'An unknown error occurred.'; // Handle unknown errors
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
