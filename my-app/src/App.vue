<script setup lang="ts">
import LandingPage from './views/LandingPage.vue'
import { onMounted, ref } from 'vue'
import { auth } from './lib/firebaseConfig' // Import the auth object from firebaseConfig

interface Session {
  user: { id: string; email: string } | null;
}

const session = ref<Session | null>(null)

onMounted(async () => {
  try {
    const user = auth.currentUser; // Get the current user
    session.value = user ? { user: { id: user.uid, email: user.email } } : null;

    // Set up an observer on the Auth object to get user updates
    auth.onAuthStateChanged((user) => {
      session.value = user ? { user: { id: user.uid, email: user.email } } : null;
    });
  } catch (error) {
    console.error('Error fetching session:', error);
  }
});
</script>

<template>
    <div class="masterpage">
      <LandingPage/>
    </div>
</template>

<style scoped>
.masterpage{
  background-color: white;
}
</style>