<template>
  <div id="top"></div>
  <div class="row" style="border-bottom: 1px solid #333; padding: 20px;">
    <div ref="greetingRef" class="greetings col-lg-6 col-12">
      <h1 class="green">THRIVE</h1>
      <h3>A new way to shop sustainably</h3>
      <nav>
        <RouterLink to="/login" style="font-size: 0.9rem;">Login</RouterLink>
        <RouterLink to="/register" style="font-size: 0.9rem;">Register</RouterLink>
      </nav>
    </div>
    
    <div ref="displayRef" class="col-lg-6 col-12">
      <RouterView />
    </div>
  </div>
  <div>
    <div style="text-align: center;">
      <h2>Timeless Style, Reimagined: Curated Thrift Fashion</h2>
      <p>Scroll down to discover a curated collection of secondhand fashion that tells its own story.</p> 
    </div> 
    <Editorial />
    <div style="text-align: center; padding-bottom: 20px;">
      <p>Love what we're doing and our product collection? <span @click="scrollToTop" style="text-decoration: underline; cursor: pointer;">Join us!</span></p> 
    </div> 
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch} from 'vue';
import gsap from 'gsap';
import { useRoute } from 'vue-router';
import Editorial from '@/views/Editorial.vue'

const route = useRoute();
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
    duration: 5,
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

watch(route, () => {
  handleAnimation();
});

const handleAnimation = () => {
  if (displayRef.value) {
    gsap.fromTo(
      displayRef.value,
      {
        opacity: 0,
        y: 40,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        // onComplete: () => {
        //   gsap.to(displayRef.value, {
        //     opacity: 0,
        //     y: -20,
        //     duration: 0.5,
        //     delay: 1,
        //     ease: 'power2.out',
        //   });
        // },
      }
    );
  }
};
const scrollToTop = () => {
      const bottomAnchor = document.getElementById('top');
      if (bottomAnchor) {
        bottomAnchor.scrollIntoView({ behavior: 'smooth' });
      }
    };
</script>

<style scoped>
.greetings {
  text-align: center;
  opacity: 0; /* Initially hidden for animation */
  padding-bottom: 20px;
}
.green{
  /* color: green; */
  font-size: 100px;
}
h1 {
  font-size: 3.6rem !important;
}

h3 {
  font-size: 1rem;
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
  color: black;
}

nav a:first-of-type {
  border-left: none;
}

nav a.router-link-active {
  color: green !important;
}

nav a.router-link-active:hover {
  background-color: transparent !important;
}

.row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 30px;
}

@media (max-width: 768px) {
  .greetings {
    flex: 1;
  }
}
</style>

