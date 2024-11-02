<template>
  <div class="row">
    <div ref="greetingRef" class="greetings col-lg-6 col-md-6 col-12">
      <h1 class="green">THRIVE</h1>
      <h3>A new way to shop sustainably</h3>
      <nav>
        <RouterLink to="/login">Login</RouterLink>
        <RouterLink to="/register">Register</RouterLink>
      </nav>
    </div>
    
    <div ref="displayRef" class="col-lg-5 col-md-5 col-11">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import gsap from 'gsap'

const greetingRef = ref<HTMLElement | null>(null)
const displayRef = ref<HTMLElement | null>(null)

// Animation function for greeting section
async function animateGreeting() {
  gsap.fromTo(greetingRef.value, 
    { opacity: 0, y: -50 }, // Start state
    { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" } // End state
  );
}

// Animation function for display section
async function animateDisplay() {
  gsap.fromTo(displayRef.value, 
    { opacity: 0, y: 50 }, // Start state
    { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" } // End state
  );
}

// Animate the text color of the brand (".green")
async function animateBrand() {
  gsap.to(".green", { 
    duration: 2,
    color: '#ffffff',
    repeat: -1,
    yoyo: true,
    ease: "power1.in"
  });
}

// Trigger animations on mount
onMounted(() => {
  animateGreeting();
  animateDisplay();
  animateBrand();
});

</script>

<style scoped>
.greetings {
  text-align: center;
  opacity: 0; /* Initially hidden for animation */
}
.green{
  color: hsla(160, 100%, 37%, 1);
  font-size: 100px;
}
h1 {
  font-weight: 500;
  font-size: 2.6rem;
}

h3 {
  font-size: 1.2rem;
  color: rgb(151, 151, 151);
}

nav {
  margin-top: 2rem;
  font-size: 1rem;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border-left: none;
}

nav a.router-link-active {
  color: var(--color-text) !important;
}

nav a.router-link-active:hover {
  background-color: transparent !important;
}

.row {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: 0;
}

@media (max-width: 768px) {
  .greetings {
    flex: 1;
  }
}
</style>

