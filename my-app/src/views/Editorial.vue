<template>
  <div class="container-fluid text-dark py-5">
    <div v-if="isLoading" class="loading-container">
      <Loading :isLoading="isLoading" message="Loading blog details..." />
    </div>
    <div v-else>
      <div class="row g-4">
        <!-- Blog Post Cards -->
        <div
          v-for="post in blogPosts"
          :key="post.id"
          class="col-12 col-md-6 col-lg-3"
          ref="blogCard"
        >
          <div class="blog-card p-4" @click="navigateToPost(post.id)">
            <div class="d-flex align-items-center mb-3">
              <img 
                :src="post.sellerAvatar || '../assets/user.jpeg'" 
                alt="Seller Avatar" 
                class="seller-avatar me-3"
                @click.stop="navigateToProfile(post.sellerId)"
              />
              <div>
                <h6 class="seller-name mb-1">{{ post.sellerName }}</h6>
                <small class="text-secondary">{{ post.date }}</small>
              </div>
            </div>
            <img :src="post.image" alt="Blog Post Image" class="blog-image mb-3">
            <h5 class="blog-title text-truncate-2">{{ post.title }}</h5>
            <p class="blog-caption text-truncate-4">{{ post.caption }}</p>
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
import ScrollTrigger from 'gsap/ScrollTrigger'; // Import ScrollTrigger

gsap.registerPlugin(ScrollTrigger); // Register the ScrollTrigger plugin

interface Editorial extends DocumentData {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string | null;
  title: string;
  caption: string;
  image: string;
  date: string;
}

interface UserData {
  username?: string;
  photoURL?: string;
}

const router = useRouter();
const blogPosts = ref<Editorial[]>([]);
const isLoading = ref(true);

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

// Animate the blog cards when they enter the viewport
const animateCards = () => {
  ScrollTrigger.batch('.blog-card', {
    onEnter: (batch) => {
      gsap.fromTo(
        batch,
        { opacity: 0, y: 50 }, // Start state when entering
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.15 } // End state when visible
      );
    },
    onLeaveBack: (batch) => {
      gsap.to(batch, { opacity: 0, y: 50, duration: 0.5, ease: 'power2.out', stagger: 0.15 }); // Animation when scrolling back up
    },
    start: 'top 50%', // Trigger point
    once: false,       // Allows it to trigger on both enter and leave
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
}

.blog-card {
  background-color: black;
  border-radius: 4px;
  /* border: 1px solid #e0e0e0; */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  opacity: 0; /* Start fully transparent */
  transform: translateY(50px); /* Start slightly offset */
  padding: 50px !important;
  margin-bottom: 70px;
}

.blog-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

.blog-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
  margin-bottom: 1rem;
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
  /* font-family: 'Georgia', serif; */
  font-weight: 400;
  color: white;
}

.blog-caption {
  font-family: 'Helvetica Neue', sans-serif;
  color: #555;
}
</style>