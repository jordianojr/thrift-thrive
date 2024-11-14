<template>
    <div v-if="isLoading" class="loading-container">
      <Loading :isLoading="isLoading" message="Loading item details..." />
    </div>
    <div v-else class="container-fluid">
      <!-- Image Carousel Section -->
      <div class="row mb-4">
        <div class="col-12 p-0">
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
            </div> -->
          </div>
  
          <!-- Deal Method -->
          

        <!-- Add to Cart Button -->
        <button
          v-if="!ownSeller"
          @click="addToCart" 
          :disabled="isProcessing"
          class="btn submit-btn py-2 w-100">
          {{ isProcessing ? 'Processing...' : 'Buy Now!' }}
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
  import { ref, onMounted, type Ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import axios from 'axios';
  import { auth, db } from '@/lib/firebaseConfig';
  import { doc, getDoc } from 'firebase/firestore';
  import Loading from "@/components/LoadingOverlay.vue";
  import { stripePromise } from '@/lib/stripeConfig'; // Import stripePromise from your config

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
  padding-top: 20px;
}


  .carousel-control-prev, .carousel-control-next {
  border-radius: 50%;
  border: 1px solid black;
  width: 50px;
  height: 50px;
  top: 50%; /* Center vertically */
  transform: translateY(-50%);
  background-color: black;
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
    color: black;
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