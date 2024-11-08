<template>
  <!-- Template remains unchanged -->
  <div>
      <h3 class="head">Editorial</h3>
    </div>
  <div class="container-fluid">
    <div class="row position-relative">

      <div v-if="userRole === 'admin'" class="d-flex justify-content-center position-absolute w-100" style="top: -1rem;">
        <button 
          id="createbtn" 
          class="btn submit-btn text-uppercase py-2" 
          @click="navigateToCreatePost"
        >
          Create Post
        </button>
      </div>

      <div
        v-for="post in blogPosts"
        :key="post.id"
        class="col-12 col-md-6 col-lg-4 products-grid"
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
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { collection, doc, getDoc, getDocs, type DocumentData } from 'firebase/firestore';
import { db, auth } from '@/lib/firebaseConfig';
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


const blogPosts = ref<Editorial[]>([]);
const isLoading = ref(true);
const router = useRouter();
const navigateToCreatePost = () => {
  router.push({ name: 'createPost' });
};

const userRole = ref('');
const getUserRole = async () => {
  try {
    const userId = auth.currentUser?.uid; // Get the current user's ID

    if (!userId) {
      throw new Error("User is not authenticated.");
    }

    // Reference to the user document in the 'users' collection
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('User role:', userData.role);
      userRole.value = userData.role; // Return the 'role' field
    } else {
      throw new Error("No user found in the database.");
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null; // Or handle the error as needed
  }
};

const getPostImages = (post: Editorial): string[] => {
  // First, check for 'images' array
  if (post.images && Array.isArray(post.images)) {
    return post.images;
  }

  // Fallback to previous checks
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
    
    // Sort posts by date in descending order (latest first)
    blogPosts.value = posts.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // Initialize carousels after posts are loaded
    nextTick(() => {
      posts.forEach(post => {
        const carouselElement = document.getElementById(`carousel-${post.id}`);
        if (carouselElement) {
          new (bootstrap as any).Carousel(carouselElement, {
            interval: 3000,
            wrap: true
          });
        }
      });
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
  } finally {
    isLoading.value = false;
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
    start: 'top 60%',
    once: false,
  });
};

onMounted(async () => {
  await getUserRole();
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
  padding-left: 40px;
  padding-right: 40px;
}

.head{
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  text-align: center;
  font-size: 1.9rem;
  color: black;
  margin: 0;
  padding-top: 45px; 
  padding-bottom: 45px; 
  border-bottom: black solid 1px;
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
  margin-top: 40px;
}

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
  text-transform: uppercase;
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

.submit-btn {
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 500;
  background-color: black !important;
  letter-spacing: 1px;
  color: white !important;
  transition: all 0.3s ease;
  text-transform: uppercase;
  text-align: center;
  font-size: 0.875rem !important;
  border: black 1px solid !important;
  cursor: pointer;
  width: 15%;
}

.submit-btn:hover {
  color: black !important;
  background-color: white !important;
  border: black 1px solid !important;
}

</style>