<template>
  <div class="homepage">
    <div class="constant" @mouseenter="showSearchBar" @mouseleave="hideSearchBar">
      <Navbar @select="handleSelect" @spinChance="handleSpinChance" />
      <ProgressBar />

      <!-- <section class="hero">
        <div ref="searchBarContainer" class="search-bar-container">
          <LuckySpin />
        </div>
      </section> -->
    </div>

    <div style="margin-top: 74px;" :class="['view', isSpin ? 'spin-view' : 'default-view']">
      <RouterView />
    </div>

    <div class="floating-bot" @click="toggleFashionBot">
      <FashionBot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from 'vue-router';
import gsap from "gsap";
import Navbar from "@/components/Navbar.vue";
import FashionBot from '@/components/FashionBot.vue';
import ProgressBar from '@/components/ProgressBar.vue';

const showProfile = ref(false);
const isFashionBotVisible = ref(false); // State for FashionBot visibility
const searchBarContainer = ref<HTMLElement | null>(null);

// Get the current route
const route = useRoute();

// Computed property to check if the current route is '/lucky-spin'
const isSpin = computed(() => route.path === '/lucky-spin');

// Function to handle navbar selection
function handleSelect(selected: string) {
  showProfile.value = !showProfile.value;
}

// Function to toggle FashionBot visibility
function toggleFashionBot() {
  isFashionBotVisible.value = !isFashionBotVisible.value;
}

// Function to show the search bar with animation
function showSearchBar() {
  gsap.to(searchBarContainer.value, {
    duration: 0.5,
    y: 0,
    ease: "power1.out",
  });
}

// Function to hide the search bar with animation
function hideSearchBar() {
  gsap.to(searchBarContainer.value, {
    duration: 0.5,
    y: "-100%",
    ease: "power1.in",
  });
}

onMounted(() => {
  // Set initial position of the search bar off-screen
  gsap.set(searchBarContainer.value, { y: "-100%" });
});
</script>

<style scoped>
.homepage {
  background-color: white;
  position: relative; /* Set to relative for absolute positioning of floating bot */
  width: 100%;
}

.hero {
  text-align: center;
  background-color: white;
  color: white;
}

.view {
  width: 100%;
}

/* Style for other routes */
.default-view {
  padding: 0px 0px 0px 0px;
}

.spin-view {
  padding: 40px 0px 0px 0px;
}
.constant {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000; /* Ensure the navbar is on top */
  background-color: white;
  width: 100%;
}

.floating-bot {
  position: fixed; /* Make it fixed to stay in place */
  bottom: 20px; /* Adjust as needed */
  right: 20px; /* Adjust as needed */
  z-index: 1001; /* Ensure it's above everything else */
}
.floating-spin {
  position: fixed; /* Make it fixed to stay in place */
  bottom: 20px; /* Adjust as needed */
  left: 20px; /* Adjust as needed */
  z-index: 1001; /* Ensure it's above everything else */
}

@media (max-width: 480px) {
  .default-view {
  padding: 0px 0px 50px 0px;
}
}
</style>