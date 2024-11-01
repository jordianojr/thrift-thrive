<template>
    <div class="landing-page">
        <div v-if="isLoggedIn" class="col-12 home">
            <Homepage />
        </div>
        <div v-else class="intro">
            <LoginPage />
        </div>
    </div>
</template>

<script lang="ts" setup>
import LoginPage from './LoginPage.vue';
import { ref, onMounted } from 'vue';
import { auth } from '../lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Homepage from '@/views/Homepage.vue';

const isLoggedIn = ref(false);

// Load the logged-in status from local storage
const loadLoginStatus = () => {
    const storedStatus = localStorage.getItem('isLoggedIn');
    isLoggedIn.value = storedStatus === 'true';
};

// Save the logged-in status to local storage
const saveLoginStatus = (status: boolean) => {
    localStorage.setItem('isLoggedIn', String(status));
};

// Check authentication status on component mount
onMounted(() => {
    loadLoginStatus(); // Load status from local storage
    onAuthStateChanged(auth, (user) => {
        const loggedIn = !!user;
        isLoggedIn.value = loggedIn; // Update the reactive variable
        saveLoginStatus(loggedIn); // Save to local storage
    });
});
</script>

<style scoped>
.landing-page {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100vw; /* Full viewport width */
    height: 100vh; /* Full viewport height */
    margin: 0; /* Remove default margin */
    padding: 0; /* Remove default padding */
    background-color: white; /* Optional background color */
    box-sizing: border-box; /* Include padding and border in the element's total width and height */
}
</style>

  
  