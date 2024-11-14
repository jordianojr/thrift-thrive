<template>
    <div v-if="isLoading" class="loading-container">
    <Loading :isLoading="isLoading" message="Loading item details..." />
  </div>
  <div v-else class="container-fluid pt-0">
    <!-- GSAP Image Gallery Section -->
    <div class="gallery-container mb-4">
      <div ref="galleryWrapper" class="gallery-wrapper">
        <div ref="gallery" class="gallery">
          <div 
            v-for="(image, index) in itemImages" 
            :key="index"
            class="gallery-item"
          >
            <img 
              :src="image" 
              :alt="`Product image ${index + 1}`"
              class="gallery-image"
            >
          </div>
        </div>
      </div>
      <!-- Progress bar -->
      <div class="progress-wrapper">
        <div ref="progressBar" class="progress-bar"></div>
      </div>
      <!-- Navigation arrows -->
      <button @click="navigate('prev')" class="nav-button prev-button">
        <span class="nav-arrow">←</span>
      </button>
      <button @click="navigate('next')" class="nav-button next-button">
        <span class="nav-arrow">→</span>
      </button>
    </div>
  
      <!-- Main Content -->
      <div class="row">
        <!-- Left Column - Item Details -->
        <div class="col-12 col-lg-8 mb-4">
          <h1 class="display-6 itemName text-black mb-3">{{ itemName }}</h1>
          <div class="price-text mb-4">
            S${{ itemPrice }}
          </div>
  
          <!-- Item Details -->
          <div class="row mb-4">
            <div class="col-6">
              <div class="detail-box">
                <h3 class="h6 text-black-50">Condition</h3>
                <p class="text-black">{{ condition }}</p>
              </div>
            </div>
            <div class="col-6">
              <div class="detail-box">
                <h3 class="h6 text-black-50">Suitable for:</h3>
                <p class="text-black">{{ gender }}</p>
              </div>
            </div>
            <div class="col-6">
              <div class="detail-box">
                <h3 class="h6 text-black-50">Listed</h3>
                <p class="text-black">{{ listedTime }}</p>
              </div>
            </div>
            <div class="col-6">
              <div class="detail-box">
                <h3 class="h6 text-black-50">Category</h3>
                <p class="text-black">{{ category }}</p>
              </div>
            </div>
            <div class="col-12">
              <div class="detail-box">
                <h3 class="h6 text-black-50 ">Description</h3>
                <p class="text-black">{{ description }}</p>
              </div>
            </div>
            <!-- <div class="col-6">
              <div class="detail-box">
                <h3 class="h6 text-black-50">Deal Method</h3>
                <p class="text-black">{{ dealMethod }}</p>
              </div>
            </div> -->
            <!-- <div class="col-6">
              <div class="detail-box">
                <h3 class="h6 text-black-50">Location</h3>
                <p class="text-black">{{ location }}</p>
              </div>
            </div>
          </div>
          

        
        <-- Add to Cart Button -->
        </div>
        <button
          v-if="!ownSeller"
          @click="addToCart" 
          :disabled="isProcessing"
          class="btn submit-btn py-2 w-100">
          {{ isProcessing ? 'Processing...' : 'Buy Now!' }}
        </button>
  
          
        </div>
  
        <!-- Right Column - Seller Info -->
        <div class="col-12 col-lg-4">
          <div class="card bg-white rounded-4 p-4">
            <!-- Seller Info -->
            <div class="d-flex align-items-center mb-4" style="cursor: pointer;" @click="goToSeller">
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
            <button @click="redirectToChat" class="btn submit-btn w-100 mb-3" :disabled="disableChat">
              Chat with seller for more info <i class="bi bi-chat-right-text ms-2"></i>
            </button>
  
            <!-- <div class="input-group mb-3">
              <input 
                v-model="offerPrice" 
                type="text" 
                class="form-control"
                placeholder="Enter amount"
              >
              <button 
                class="btn text-white" 
                style="background-color: green"
              >
                Make Offer
              </button>
            </div> -->
            
            <!-- Safety Notice -->
            <div class="small text-muted mt-3">
              <p style="color: black" class="mb-2">Returns and refunds depend on the seller's decision. Not covered by Buyer Protection.</p>
              <p style="color: black" class="mb-0">Pay only at the meet-up. Transferring money directly to strangers puts you at risk of e-commerce scams.</p>
            </div>
            <div class="card bg-white rounded-2 p-4" style="margin-top: 20px; padding: 10px !important;">
              <h5>Vouchers</h5>
              <p v-if="vouchers.length === 0">No vouchers available</p>
              <div v-else>
                <select id="voucher-select" v-model="selectedVoucher" @change="applyVoucher">
                <option v-for="voucher in vouchers" :key="voucher.id" :value="[voucher.prize, voucher.id]">
                  {{ voucher.id }} - {{ voucher.prize }}
                </option>
                </select>
              <p>Selected Voucher: {{ selectedVoucher[0] }}</p>              
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { auth, db } from '@/lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import Loading from "@/components/LoadingOverlay.vue";
import { stripePromise } from '@/lib/stripeConfig';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

  const router = useRouter();
  const route = useRoute();
  const itemId = route.params.id as string;
  const category = route.params.category as string;

  const isProcessing = ref(false);

  const ownSeller = ref(false);
  const disableChat = ref(false);

  const itemImages = ref<string[]>([]);
  const itemName = ref('');
  const itemPrice = ref(0);
  let originalPrice = 0;
  const condition = ref('');
  const gender = ref('');
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
  const selectedVoucher = ref([]);  

  interface Voucher {
  id: string; // Or use 'any' if you’re unsure of the type
  // Add other properties of your voucher documents if needed
  prize?: string; // Optional example property
}

const vouchers: Ref<Voucher[]> = ref([]);
  
  const applyVoucher = () => {
    console.log('Selected voucher:', selectedVoucher.value[0]);
    const text = selectedVoucher.value[0];
    const number = parseInt(text.match(/\d+/)[0], 10);
    const percentage = 1 - number/100; // 10% discount
    itemPrice.value = (originalPrice * percentage).toFixed(2);
  };

  const gallery = ref(null);
const galleryWrapper = ref(null);
const progressBar = ref(null);
const currentIndex = ref(0);
const totalSlides = ref(0);

const initGallery = () => {
  if (!gallery.value || !progressBar.value) return;

  totalSlides.value = itemImages.value.length;
  
  // Set initial styles
  gsap.set(gallery.value, {
    x: 0,
  });

  // Create smooth scroll animation
  const tl = gsap.timeline({
    defaults: { duration: 1, ease: "power2.inOut" }
  });

  // Update progress bar
  watch(currentIndex, (newIndex) => {
    gsap.to(progressBar.value, {
      scaleX: (newIndex + 1) / totalSlides.value,
      duration: 0.5,
      ease: "power2.out"
    });
  });
};

const navigate = (direction: 'prev' | 'next') => {
  if (!gallery.value) return;

  const slideWidth = gallery.value.children[0].offsetWidth;
  const maxIndex = totalSlides.value - 1;

  if (direction === 'next' && currentIndex.value < maxIndex) {
    currentIndex.value++;
  } else if (direction === 'prev' && currentIndex.value > 0) {
    currentIndex.value--;
  }

  gsap.to(gallery.value, {
    x: -slideWidth * currentIndex.value,
    duration: 1,
    ease: "power2.inOut"
  });
};

// Modified onMounted
onMounted(async () => {
  await fetchVouchers();
  await fetchItem();
  initGallery();
});

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
        gender.value = data.gender || 'N/A';
        listedTime.value = data.listedDate || 'N/A';
        sellerName.value = data.userName || 'Anonymous Seller';
        sellerId.value = data.userId || 'N/A';
        dealMethod.value = data.dealMethod || 'N/A';
        location.value = data.location || 'N/A';
        description.value = data.description || 'N/A';
  
        // Fetch user data based on sellerId
        checkSeller(sellerId.value);
        await fetchUserData(sellerId.value);
        originalPrice = itemPrice.value;
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
  
  const getUserUID = () => {
    const cachedData = localStorage.getItem(`user`);
    if (cachedData) {
    const userData = JSON.parse(cachedData);
    return userData.uid;
    } else {
    return auth.currentUser?.uid;
    }
};

  const fetchVouchers = async () => {
  try {
    const userId = getUserUID()
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    const userVouchers = userDocSnap.data()?.vouchers || [];

    const fetchedVouchers: Voucher[] = []; // Ensure this array matches the Voucher type

    for (const voucherId of userVouchers) {
      const voucherDocRef = doc(db, 'prizes', voucherId);
      const voucherDocSnap = await getDoc(voucherDocRef);

      if (voucherDocSnap.exists()) {
        fetchedVouchers.push({ id: voucherId, ...voucherDocSnap.data() } as Voucher);
      }
    }

    vouchers.value = fetchedVouchers; // This should work now without errors

    console.log(vouchers.value); // Verify the populated data
  } catch (error) {
    console.error("Error fetching vouchers:", error);
  }
};

onMounted( async () => {
    await fetchVouchers();
    fetchItem();
    });

  const addToCart = async () => {
  try {
    if (!itemId || !itemName.value || !itemPrice.value) {
      console.error('Missing required item data');
      alert('Error: Could not process payment');
      return;
    }

    isProcessing.value = true;
    console.log(selectedVoucher.value[1]);
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/create-checkout-session`, {
      price: itemPrice.value,
      name: itemName.value,
      voucher: selectedVoucher.value[1],
      itemId: itemId,
      category: category
    });
    console.log(response.data);
    const { sessionId } = response.data;
    const stripe = await stripePromise;
    console.log('Redirecting to checkout:', sessionId);
    const { error } = await stripe.redirectToCheckout({
      sessionId
    });

    if (error) {
      console.error('Error:', error);
      alert('Payment failed. Please try again.');
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    alert('Error: Could not process payment');
  } finally {
    isProcessing.value = false;
  }
};
  
  const checkSeller = (sellerId: string | undefined) => {
      if (auth.currentUser?.uid === sellerId) {
        ownSeller.value = true;
        disableChat.value = true;
      }
    };
  const redirectToChat = () => {
    router.push({
      name: 'chat',
      params: { 
        sellerId: sellerId.value, 
        itemId: itemId,
        category: category 
      }
    });
  };

  const goToSeller = () => {
    if (sellerId.value === auth.currentUser?.uid) {
      router.push({ name: 'profile' });
      return;
    }
    router.push({
      name: 'sellerprofile',
      params: { sellerId: sellerId.value }
    });
  };
  </script>
    
  <style scoped>
  /* Base page styling */
  :deep(body) {
    background-color: #000;
  }

  #itemCarousel {
  border-bottom: 1px black solid;
  margin: 0 -100vw;
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}

.container-fluid {
  padding: 0 4.5rem;
}


.gallery-container {
  position: relative;
  width: 100%;
  height: 600px;
  overflow: hidden;
  background: #fff;
}

.gallery-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.gallery {
  display: flex;
  height: 100%;
  will-change: transform;
}

.gallery-item {
  flex: 0 0 100%;
  height: 100%;
  position: relative;
}

.gallery-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.progress-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: rgba(0, 0, 0, 0.1);
}

.progress-bar {
  width: 100%;
  height: 100%;
  background: black;
  transform-origin: left center;
  transform: scaleX(0);
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.8);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.nav-button:hover {
  background: black;
}

.prev-button {
  left: 20px;
}

.next-button {
  right: 20px;
}

.nav-arrow {
  font-size: 24px;
  line-height: 1;
}
  
  /* Price styling */
  .price-text {
    font-size: 1.6rem;
    font-weight: 600;
    font-family: 'Helvetica Neue', sans-serif;
    color: hsla(160, 100%, 37%, 1);
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
  .container-fluid{
    padding: 0 4.5rem ;
    border: 1px solid lightgrey;
    padding-top: 20px;
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

.itemName {
  font-family: 'Helvetica Neue', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    text-align: left;
    font-size: 1.9rem;
    color: black;
    margin: 0;
}

h3, p {
  font-family: 'Helvetica Neue', sans-serif;
  color: black;
  font-size: 1rem;
  font-weight: 400;
}


  </style>