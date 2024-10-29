<template>
    <div v-if="isLoading" class="loading-container">
      <Loading :isLoading="isLoading" message="Loading item details..." />
    </div>
    <div v-else class="container-fluid">
      <!-- Image Carousel Section -->
      <div class="row mb-4">
        <div class="col-12">
          <div id="itemCarousel" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
              <div v-for="(image, index) in itemImages" 
                   :key="index" 
                   :class="['carousel-item', index === 0 ? 'active' : '']">
                <img :src="image" class="d-block w-100 carousel-img" :alt="`Product image ${index + 1}`">
              </div>
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#itemCarousel" data-bs-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#itemCarousel" data-bs-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Next</span>
            </button>
          </div>
        </div>
      </div>
  
      <!-- Main Content -->
      <div class="row">
        <!-- Left Column - Item Details -->
        <div class="col-12 col-lg-8 mb-4">
          <h1 class="display-6 text-white mb-3">{{ itemName }}</h1>
          <div class="price-text mb-4" style="color: hsla(160, 100%, 37%, 1)">
            S${{ itemPrice }}
          </div>
  
          <!-- Item Details -->
          <div class="row mb-4">
            <div class="col-6">
              <div class="detail-box">
                <h3 class="h6 text-white-50">Condition</h3>
                <p class="text-white">{{ condition }}</p>
              </div>
            </div>
            <div class="col-6">
              <div class="detail-box">
                <h3 class="h6 text-white-50">Type</h3>
                <p class="text-white">{{ type }}</p>
              </div>
            </div>
            <div class="col-6">
              <div class="detail-box">
                <h3 class="h6 text-white-50">Listed</h3>
                <p class="text-white">{{ listedTime }}</p>
              </div>
            </div>
            <div class="col-6">
              <div class="detail-box">
                <h3 class="h6 text-white-50">Category</h3>
                <p class="text-white">{{ category }}</p>
              </div>
            </div>
          </div>
  
          <!-- Deal Method -->
          <div class="deal-method p-4 mb-4 rounded">
            <h3 class="h5 text-white mb-3">Deal Method</h3>
            <p class="text-white mb-2">{{ dealMethod }}</p>
            <p class="text-white-50 small">{{ location }}</p>
          </div>

        <!-- Add to Cart Button -->
        <button 
          @click="addToCart" 
          class="btn btn-danger w-100 mb-4">
          Add to Cart
        </button>
  
          <!-- Description -->
          <div class="mb-4">
            <h3 class="h5 text-white mb-3">Description</h3>
            <p class="text-white-50">{{ description }}</p>
          </div>
        </div>
  
        <!-- Right Column - Seller Info -->
        <div class="col-12 col-lg-4">
          <div class="card bg-white rounded-4 p-4">
            <!-- Seller Info -->
            <div class="d-flex align-items-center mb-4">
              <img v-if="sellerAvatar" :src="sellerAvatar" alt="Seller avatar" class="rounded-circle me-3" style="width: 48px; height: 48px;">
              <img v-else src="../assets/user.jpeg" alt="Seller avatar" class="rounded-circle me-3" style="width: 48px; height: 48px;">
              <div>
                <h3 class="h5 mb-1">{{ sellerName }}</h3>
                <div class="d-flex align-items-center">
                  <span class="text-warning me-1">★</span>
                  <span class="text-dark">{{ rating }} ({{ reviews.length }} review(s))</span>
                </div>
              </div>
            </div>
  
            <!-- Action Buttons -->
            <button @click="redirectToChat" class="btn btn-secondary w-100 mb-3 disabled">
              Chat with Seller
            </button>
  
            <div class="input-group mb-3">
              <input 
                v-model="offerPrice" 
                type="text" 
                class="form-control"
                placeholder="Enter amount"
              >
              <button 
                class="btn text-white" 
                style="background-color: hsla(160, 100%, 37%, 1)"
              >
                Make Offer
              </button>
            </div>
  
            <!-- Safety Notice -->
            <div class="small text-muted mt-3">
              <p style="color: black" class="mb-2">Returns and refunds depend on the seller's decision. Not covered by Buyer Protection.</p>
              <p style="color: black" class="mb-0">Pay only at the meet-up. Transferring money directly to strangers puts you at risk of e-commerce scams.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useCartStore } from '@/stores/cartStore';
  import { db } from '@/lib/firebaseConfig';
  import { doc, getDoc } from 'firebase/firestore';
  import Loading from "@/components/LoadingOverlay.vue";
  
  const router = useRouter();
  const route = useRoute();
  const itemId = route.params.id as string;
  const category = route.params.category as string;

  const cartStore = useCartStore(); // Use the cart store

  
  const itemImages = ref<string[]>([]);
  const itemName = ref('');
  const itemPrice = ref(0);
  const condition = ref('');
  const type = ref('');
  const listedTime = ref('');
  const dealMethod = ref('');
  const location = ref('');
  const description = ref('');
  const sellerAvatar = ref(''); // Default avatar
  const sellerName = ref('');
  const sellerId = ref('');
  const rating = ref(0);
  const reviews = ref([]);
  const offerPrice = ref('');
  const isLoading = ref(true);
  
  const fetchUserData = async (userId: string) => {
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      sellerAvatar.value = userData.photoURL || '';
      rating.value = userData.rating || 0;
      reviews.value = userData.reviews || 0;
    } else {
      console.error("No such user!");
    }
  };
  
  const fetchItem = async () => {
    try {
      const docRef = doc(db, category, itemId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        itemImages.value = data.itemPhotoURLs || [];
        itemName.value = data.itemName || 'Unnamed Item';
        itemPrice.value = data.itemPrice || 0;
        condition.value = data.condition || 'N/A';
        type.value = data.type || 'N/A';
        listedTime.value = data.listedDate || 'N/A';
        sellerName.value = data.userName || 'Anonymous Seller';
        sellerId.value = data.userId || 'N/A';
        dealMethod.value = data.dealMethod || 'N/A';
        location.value = data.location || 'N/A';
        description.value = data.description || 'N/A';
  
        // Fetch user data based on sellerId
        await fetchUserData(sellerId.value);
      } else {
        console.error("No such item!");
        alert("Item not found. Please try again.");
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      alert("Error fetching item details. Please try again.");
    } finally {
      isLoading.value = false;
    }
  };
  
  onMounted(fetchItem);

  const addToCart = () => {
  cartStore.addItemToCart({
    id: itemId,
    name: itemName.value,
    price: itemPrice.value,
    quantity: 1,
    image: itemImages.value[0] || '',
  });
  alert('Item added to cart!');
};
  
  const redirectToChat = () => {
    router.push({
      name: 'Chat',
      params: { 
        sellerId: sellerId.value, 
        itemId: itemId
      }
    });
  };
  </script>
    
  <style scoped>
  /* Base page styling */
  :deep(body) {
    background-color: #000;
  }
  
  .carousel-inner{
    height: 500px;
  }
  /* Loading container */
  .loading-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #000;
    color: #fff;
  }
  .carousel-item {
  height: 100%; /* Ensure each carousel item takes full height */
}
  /* Carousel image sizing */
  .carousel-img {
  height: 100%; /* Image fills the height of the carousel item */
  width: auto; /* Maintain aspect ratio */
  max-width: 100%; /* Ensure the image doesn’t overflow */
  object-fit: contain; /* Show the entire image */
}
  
  /* Price styling */
  .price-text {
    font-size: 1.5rem;
    font-weight: 600;
  }
  
  /* Detail boxes */
  .detail-box {
    margin-bottom: 1.5rem;
  }
  
  /* Deal method section */
  .deal-method {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  /* Custom rounded corners for seller card */
  .rounded-4 {
    border-radius: 1rem;
  }
  </style>