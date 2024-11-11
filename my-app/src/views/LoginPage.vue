<template>
  <div id="top"></div>
  <div class="row" style="border-bottom: 1px solid #333; padding: 20px;">
    <div ref="greetingRef" class="greetings col-lg-6 col-12">
      <h1 class="green">THRIVE</h1>
      <h3>A new way to thrift</h3>
      <nav>
        <RouterLink to="/login">Login</RouterLink>
        <RouterLink to="/register">Register</RouterLink>
      </nav>
    </div>
    
    <div ref="displayRef" class="col-lg-6 col-12">
      <RouterView />
    </div>

  </div>
  <div>
    <div style="text-align: center; margin: auto">
      <h2 class="desc">Secondhand Fashion<br> curated by thrive.</h2> 
    </div> 
    <div class="row" style="margin: auto; margin-top: 20px;">
      <div class="scroll-popup">
        <p>Scroll <i class="bi bi-arrow-down-circle-fill"></i></p> 
      </div>
    </div>

    <Editorial />
    <div style="text-align: center; padding-bottom: 20px;">
      <p>Love what we're doing and our product collection?</p>
      <p @click="scrollToTop" style="text-decoration: underline; cursor: pointer;">Join us!</p>
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

// Your existing animation functions
async function animateGreeting() {
  gsap.fromTo(greetingRef.value, 
    { opacity: 0, y: -50 },
    { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" }
  );
}

async function animateDisplay() {
  gsap.fromTo(displayRef.value, 
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" }
  );
}

async function animateBrand() {
  gsap.to(".green", { 
    duration: 5,
    color: '#ffffff',
    repeat: -1,
    yoyo: true,
    ease: "power1.in"
  });
}

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
  background: none;
  border: none;
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 3.6rem !important; 
}

h3 {
  background: none;
  border: none;
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 400;
  text-transform: uppercase;
  font-size: 1rem !important; 
}

p{
  background: none;
  border: none;
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 400;
  text-transform: uppercase;
  font-size: 0.8rem;
}

.desc{
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 1.2rem !important;
  color: black;
  margin-top: 60px;
}

nav {
  margin-top: 1.6rem;
  font-size: 0.9rem;
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 400;
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
.scroll-popup {
  background-color: #333;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  width: 110px;
  height: 40px;
  transition: opacity 0.3s ease; /* Smooth transition for opacity */
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-15px); }
  60% { transform: translateY(-10px); }
}
</style>

