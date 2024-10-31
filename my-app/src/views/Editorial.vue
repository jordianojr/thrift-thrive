<template>
  <div class="container-fluid py-5">
    <div v-if="isLoading" class="loading-container">
      <Loading :isLoading="isLoading" message="Loading blog details..." />
    </div>
    <div v-else>
      <div class="row">
        <!-- Blog Post Cards -->
        <div
          v-for="post in blogPosts"
          :key="post.id"
          class="col-12 col-md-6 col-lg-4"
          ref="blogCard"
        >
          <div class="blog-card">
            <!-- Image Carousel -->
            <div id="carousel-${post.id}" class="carousel slide" data-bs-ride="carousel" @click="navigateToPost(post.id)">
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

            <!-- Post Content -->
            <div class="post-content p-4">
              <div class="d-flex align-items-center mb-3" @click.stop="navigateToProfile(post.sellerId)">
                <img 
                  :src="post.sellerAvatar || '../assets/user.jpeg'" 
                  alt="Seller Avatar" 
                  class="seller-avatar me-3"
                />
                <div>
                  <h6 class="seller-name mb-1">{{ post.sellerName }}</h6>
                  <small class="text-secondary">{{ post.date }}</small>
                </div>
              </div>
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

gsap.registerPlugin(ScrollTrigger);

interface Editorial extends DocumentData {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string | null;
  title: string;
  caption: string;
  image: string;
  images?: string[]; // Add support for multiple images
  date: string;
}

interface UserData {
  username?: string;
  photoURL?: string;
}

const router = useRouter();
const blogPosts = ref<Editorial[]>([]);
const isLoading = ref(true);

// Helper function to get post images (either array or single image)
const getPostImages = (post: Editorial) => {
  if (post.images && post.images.length > 0) {
    return post.images;
  }
  return [post.image];
};

const fetchEditorials = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'Editorial'));
    const posts: Editorial[] = [];
    
    for (const document of querySnapshot.docs) {
      const postData = document.data();
      const sellerRef = doc(db, 'users', postData.sellerId);
      const sellerSnapshot = await getDoc(sellerRef);
      const sellerData = sellerSnapshot.exists() ? sellerSnapshot.data() as UserData : null;
      
      posts.push({
        id: document.id,
        ...postData,
        sellerName: sellerData?.username || 'Anonymous',
        sellerAvatar: sellerData?.photoURL || null
      } as Editorial);
    }
    
    blogPosts.value = posts;
    isLoading.value = false;
  } catch (error) {
    console.error('Error fetching blog posts:', error);
  }
};

const navigateToProfile = (sellerId: string) => {
  router.push({
    name: 'profile',
    params: { userId: sellerId }
  });
};

const navigateToPost = (postId: string) => {
  router.push({
    name: 'blogPost',
    params: { id: postId }
  });
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
.container-fluid {
  margin: auto;
  max-width: 1400px;
  padding-left: 2rem;
  padding-right: 2rem;
}

.row {
  margin: -1.5rem;  /* Negative margin to offset card padding */
}

.col-12 {
  padding: 1.5rem;  /* Uniform padding for grid spacing */
}

.blog-card {
  background-color: black;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  opacity: 0;
  transform: translateY(50px);
}

.blog-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.blog-image {
  width: 100%;
  aspect-ratio: 3/4;  /* Portrait aspect ratio */
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

.seller-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  border: 1px solid #e0e0e0;
}

.seller-avatar:hover {
  opacity: 0.9;
}

.seller-name {
  font-weight: 500;
  color: hsla(160, 100%, 37%, 1)
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
  color: lightgrey !important;
  font-weight: 100;
}

h5.blog-title {
  font-weight: 400;
  color: white;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.blog-caption {
  font-family: 'Helvetica Neue', sans-serif;
  color: #555;
}
</style>