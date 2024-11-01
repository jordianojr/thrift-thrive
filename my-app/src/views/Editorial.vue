<template>
  <!-- Template remains unchanged -->
  <div class="container-fluid py-5">
    <div v-if="isLoading" class="loading-container">
      <Loading :isLoading="isLoading" message="Loading blog details..." />
    </div>
    <div v-else>
      <div class="row">
        <div class="d-flex justify-content-center mt-4">
        <button class="btn btn-white border-1" @click="navigateToCreatePost">
          Create Post
        </button>
      </div>
        <div
          v-for="post in blogPosts"
          :key="post.id"
          class="col-12 col-md-6 col-lg-4"
          ref="blogCard"
        >
          <div class="blog-card">
            <div :id="`carousel-${post.id}`" class="carousel slide" data-bs-ride="carousel">
              <div class="carousel-inner">
                <div class="carousel-item" v-for="(image, index) in getPostImages(post)" :key="index"
                  :class="{ active: index === 0 }">
                  <img :src="image" class="d-block w-100 blog-image" :alt="`Slide ${index + 1}`">
                </div>
              </div>
              <button class="carousel-control-prev" type="button" :data-bs-target="'#carousel-' + post.id"
                data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
              </button>
              <button class="carousel-control-next" type="button" :data-bs-target="'#carousel-' + post.id"
                data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
              </button>
            </div>

            <div class="post-content p-4">
              <h5 class="blog-title text-truncate-2">{{ post.title }}</h5>
              <p class="blog-caption text-truncate-4">{{ post.caption }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { collection, getDocs, doc, getDoc, type DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import Loading from '@/components/Loading.vue';
import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
// Add type assertion for bootstrap import
// @ts-ignore
import * as bootstrap from 'bootstrap';

gsap.registerPlugin(ScrollTrigger);

interface Editorial extends DocumentData {
  id: string;
  title: string;
  caption: string;
  image?: string;
  images?: string[];
  date: string;
}

const router = useRouter();
const blogPosts = ref<Editorial[]>([]);
const isLoading = ref(true);
const navigateToCreatePost = () => {
  router.push({ name: 'CreatePost' });
};

const getPostImages = (post: Editorial): string[] => {
  if (post.image && typeof post.image === 'object') {
    return Object.values(post.image).filter(img => typeof img === 'string');
  }

  if (typeof post.image === 'string') {
    return [post.image];
  }

  return [];
};

const fetchEditorials = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'Editorial'));
    const posts: Editorial[] = [];
    
    for (const document of querySnapshot.docs) {
      const postData = document.data();
      posts.push({
        id: document.id,
        ...postData
      } as Editorial);
    }
    
    blogPosts.value = posts;
    isLoading.value = false;

    // Initialize carousels after posts are loaded
    nextTick(() => {
      posts.forEach(post => {
        const carouselElement = document.getElementById(`carousel-${post.id}`);
        if (carouselElement) {
          // Use type assertion for bootstrap.Carousel
          new (bootstrap as any).Carousel(carouselElement, {
            interval: 3000,
            wrap: true
          });
        }
      });
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
  }
};

const animateCards = () => {
  ScrollTrigger.batch('.blog-card', {
    onEnter: (batch) => {
      gsap.fromTo(
        batch,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.15 }
      );
    },
    onLeaveBack: (batch) => {
      gsap.to(batch, { opacity: 0, y: 50, duration: 0.5, ease: 'power2.out', stagger: 0.15 });
    },
    start: 'top 50%',
    once: false,
  });
};

onMounted(async () => {
  await fetchEditorials();
  nextTick(() => {
    animateCards();
  });
});
</script>

<style scoped>
/* Styles remain unchanged */
.container-fluid {
  margin: auto;
  max-width: 1400px;
  padding-left: 2rem;
  padding-right: 2rem;
}

.row {
  margin: -1.5rem;
}

.col-12 {
  padding: 1.5rem;
}

.blog-card {
  background-color: white;
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); */
  transition: transform 0.3s, box-shadow 0.3s;
  opacity: 0;
  transform: translateY(50px);
}

/* .blog-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px hsla(160, 100%, 37%, 1);
} */

.blog-image {
  width: 100%;
  aspect-ratio: 3/4;
  object-fit: cover;
}

.carousel {
  background: #000;
}

.carousel-item {
  aspect-ratio: 4/3;
}

.post-content {
  padding: 2rem !important;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.text-truncate-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: black !important;
  font-weight: 100;
}

h5.blog-title {
  font-weight: 400;
  color: black;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.blog-caption {
  font-family: 'Helvetica Neue', sans-serif;
  color: black;
  font-size: 0.875rem;
  font-weight: 300;
}
</style>