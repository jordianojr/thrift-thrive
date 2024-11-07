<template>
  <div>
    <h2 class="header" style="font-size: 1.6rem;">Register</h2>
    <p class="description" style="font-size: 1rem !important;">Create a new account!</p>
    <form class="row flex-center flex" @submit.prevent="handleRegister">
      <div class="form-widget">
        <div>
          <input
            class="inputField"
            required
            type="email"
            placeholder="Your email"
            v-model="email"
          />
        </div>
        <div>
          <input
            class="inputField"
            required
            type="password"
            placeholder="Your password"
            v-model="password"
          />
        </div>
        <div v-if="statusMessage" class="error">{{ statusMessage }}</div>
        <div>
          <input
            type="submit"
            class="buttonBlock"
            style="font-size: 0.8rem !important;"
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
  font-size: 1rem;    
  border: 1px solid #000; 
  border-radius: 4px; 
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  margin: 5px 0;
}

.buttonBlock {
  float: inline-end;
  width: 80px;
  height: 30px;
}

.error {
  color: red; /* Style for error message */
  margin-top: 10px;
}
h2, p {
  color: black;
}
</style>
