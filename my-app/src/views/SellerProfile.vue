<template>
      <!-- for alerts popping in and out-->
      <CustomAlert :visible="showAlert" :message="alertMessage" :alert-type="alertType" :timeout="3000"
      @update:visible="showAlert = $event" />

    <div class="row">
      <div ref="profileRef" class="card col-lg-3 col-12 profile mx-auto" style="width: 18rem;">
        <div class="card-body">
          <h4 class="card-title">Profile</h4>
          <div v-if="photoURL" class="profile-photo">
            <img :src="photoURL" alt="Profile Photo" />
          </div>
          <div v-else class="profile-photo">
            <img src="../assets/user.jpeg" alt="Profile Photo" />
          </div>
          <p class="card-text" style="color: black"><strong>Email:</strong> {{ userEmail }}</p>
          <p class="card-text" style="color: black"><strong>Name:</strong> {{ name }}</p>
          <p class="card-text" style="color: black"><strong>Rating: </strong> {{ rating }}
          <span v-for="n in 5" :key="n">
            <i 
              :class="{
                'bi-star-fill': n <= rating, 
                'bi-star': n > rating
              }" 
              style="color: black; font-size: 1.2rem;">
            </i>
          </span>
          </p>
          <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <button style="width: 100%; background-color: white; color: black; border: 1px solid black;" type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#giveReviewModal">
            <i class="bi bi-review"></i> Review User
          </button>
        </div>
        <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <button style="width: 100%; background-color: black; color: white; border: 1px solid black;" type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#viewReviewModal">
            <i class="bi bi-review"></i> View Reviews
          </button>
        </div>
        </div>
      </div>
      <div ref="customColRef" class="col-lg-9 col-12 custom-col mx-auto">
        <div class="container-fluid">
        <h3 style="padding-bottom: 10px">Listings</h3>
        <Loading :isLoading="isLoading" message="Fetching your products..." />
        <div v-if="!isLoading">
            <div class="row">
            <div v-for="product in products" :key="product.id" class="col-lg-4 col-md-6 col-sm-12">
                <div class="card mb-4">
                <img :src="product.itemPhotoURLs" class="card-img-top img-fluid" alt="Product Image">
                <div class="card-body">
                    <h4 class="card-title">{{ product.itemName }}</h4>
                    <h5 class="card-subtitle mb-2 text-muted">${{ product.itemPrice }}</h5>
                    <h6 class="card-subtitle">{{ product.seller }}</h6>
                    <p class="card-text">{{ product.description }}</p>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="giveReviewModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="giveReviewModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="editProfileModalLabel">
            <i class="bi bi-pen-fill"></i> Review User
          </h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitReview">
            <div>
              <label for="reviewRating" class="form-label">Rating</label>
              <div class="stars">
                <span v-for="n in 5" :key="n" @click="setRating(n)" :class="{'bi-star-fill': n <= reviewRating, 'bi-star': n > reviewRating}" style="color: black; font-size: 1.5rem; cursor: pointer;"></span>
              </div>
            <!-- Review Text Area -->
              <div>
                <label for="reviewText" class="form-label">Review</label>
                <textarea id="reviewText" v-model="reviewText" class="form-control" rows="3" placeholder="Write your review..."></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="submit" class="btn btn-dark">Submit Review</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="viewReviewModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="viewReviewModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="editProfileModalLabel">
            <i class="bi bi-journal-text"></i> User Reviews
          </h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-if="reviews.length === 0">
            <p>No reviews yet.</p>
          </div>
          <div v-else >
            <ol>
              <li v-for="review in reviews"> {{ review }}</li>
            </ol>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  </template>
  
  <script setup lang="ts">
  import gsap from 'gsap'
  import { ref, onMounted } from 'vue';
  import { db } from '../lib/firebaseConfig'; 
  import { doc, getDoc, collection, getDocs, query, where, setDoc } from 'firebase/firestore';
  import { useRoute } from 'vue-router';
  import Loading from "@/components/Loading.vue"; // Adjust the path as necessary
  import CustomAlert from "@/components/CustomAlert.vue";

// Added these refs for alert handling
const showAlert = ref(false);
const alertMessage = ref('');
const alertType = ref('info');  // Can be 'info', 'success', 'warning', or 'error'

// Helper function to show alerts
const showCustomAlert = (message: string, type: 'info' | 'success' | 'warning' | 'error') => {
  alertMessage.value = message;
  alertType.value = type;
  showAlert.value = true;
};

  const route = useRoute();
  const sellerId = route.params.sellerId as string;
  const userEmail = ref('');
  const name = ref('');
  const photoURL = ref('');
  const profileRef = ref<HTMLElement | null>(null);
  const customColRef = ref<HTMLElement | null>(null);
  const products = ref<any[]>([]);
  const isLoading = ref(true);
  const rating = ref(0);
  const reviews = ref<any[]>([]);
  const reviewRating = ref(0);
  const reviewText = ref('');

  const fetchUserData = async (uid: string) => {
    const userDoc = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userDoc);
  
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      userEmail.value = userData.email || '';
      name.value = userData.username || '';
      photoURL.value = userData.photoURL || '';
      rating.value = userData.rating || 0;
      reviews.value = userData.reviews || [];
    }
  };

  const setRating = (ratingValue: number) => {
    reviewRating.value = ratingValue;
  };

  // Submit the review
  async function updateUserReview(userId: string, review: string, rating: number) {
  const userDoc = doc(db, 'users', userId);
  const userSnapshot = await getDoc(userDoc);

  if (userSnapshot.exists()) {
    const userData = userSnapshot.data();
    const updatedReviews = [...userData.reviews, review];
    const updatedRating = (userData.rating * userData.reviews.length + rating) / (userData.reviews.length + 1);

    await setDoc(userDoc, { reviews: updatedReviews, rating: updatedRating }, { merge: true });

    return { updatedReviews, updatedRating };
  } else {
    throw new Error(`User with ID ${userId} not found.`);
  }
}

const submitReview = async () => {
  if (!reviewText.value) {
    //alert('Please enter a review.');
    showCustomAlert('Please enter a review', 'error');
    return;
  }

  if (reviewRating.value < 1 || reviewRating.value > 5) {
    //alert('Please enter a rating between 1 and 5.');
    showCustomAlert('Please enter a rating between 1 and 5.', 'error');
    return;
  }

  try {
    const { updatedReviews, updatedRating } = await updateUserReview(sellerId, reviewText.value, reviewRating.value);
    reviews.value = updatedReviews;
    rating.value = updatedRating;
    //alert('Review submitted successfully!');
    showCustomAlert('Review submitted successfully!', 'success');
    reviewText.value = '';
    reviewRating.value = 0;
  } catch (error) {
    console.error('Error submitting review:', error);
    //alert('Failed to submit review. Please try again later.');
    showCustomAlert('Failed to submit review. Please try again later.', 'error');
  }
};

  const fetchProducts = async () => {
    const uid = sellerId;
      const collectionsToCheck = ['Shoes', 'Accessories', 'Belt', 'T-shirt', 'Jeans', 'Outerwear'];
      const fetchedProducts: any[] = [];
  
      try {
        for (const collectionName of collectionsToCheck) {
          const collectionRef = collection(db, collectionName);
          const q = query(collectionRef, where('userId', '==', uid));
          const querySnapshot = await getDocs(q);
  
          querySnapshot.forEach((doc) => {
            fetchedProducts.push({ id: doc.id, ...doc.data() });
          });
        }
  
        products.value = fetchedProducts;
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    isLoading.value = false;
  };

  onMounted(() => {
    fetchUserData(sellerId);
    fetchProducts();
    gsap.fromTo(profileRef.value, 
      { x: '-100%', opacity: 0 }, 
      { x: '0%', opacity: 1, duration: 1, ease: 'power2.out' }
    );
  
    gsap.fromTo(customColRef.value, 
      { x: '100%', opacity: 0 }, 
      { x: '0%', opacity: 1, duration: 1, ease: 'power2.out' }
    );
  });

  </script>
  
  <style scoped>
  .profile-container {
    max-width: 600px;
    margin: auto;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  h4 {
    text-align: center;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  input[type="text"],
  input[type="file"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .profile {
    height: 100%;
  }
  
  .profile-photo {
    display: flex;
    justify-content: center; /* Horizontally center the image */
    align-items: center; /* Vertically center the image (if necessary) */
    margin-top: 15px;
    margin-bottom: 15px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    overflow: hidden;
    background-color: #f0f0f0;
    margin-left: auto; /* Center the container horizontally */
    margin-right: auto; /* Center the container horizontally */
  }
  .col-9{
    padding-right: 0px;
  }
  .card {
    margin-bottom: 20px;
    width: 100%;
  }
  
  .profile-photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
  
  @media (max-width: 1228px) {
    .custom-col {
      flex: 0 0 100%; /* Make it full width */
      max-width: 100%; /* Prevent it from exceeding full width */
    }
  }
  .container-fluid {
    color: black;
    background-color: #fbfbfb;
    border-radius: 10px;
    padding-top: 15px;
  }
  .card-subtitle, .card-text {
    color: black;
  }
  .card-img-top {
    width: 100%;
    height: 250px;
    object-fit: cover;
  }

  </style>
  