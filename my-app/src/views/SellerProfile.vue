<template>
    <div class="row">
      <div ref="profileRef" class="card col-lg-3 col-12 profile mx-auto" style="width: 18rem;">
        <div class="card-body">
          <h4 class="card-title">Your Profile</h4>
          <div v-if="photoURL" class="profile-photo">
            <img :src="photoURL" alt="Profile Photo" />
          </div>
          <div v-else class="profile-photo">
            <img src="../assets/user.jpeg" alt="Profile Photo" />
          </div>
          <p class="card-text" style="color: black"><strong>Email:</strong> {{ userEmail }}</p>
          <p class="card-text" style="color: black"><strong>Name:</strong> {{ name }}</p>
          <button style="width: 80%; float: inline-end;" type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
            <i class="bi bi-pencil-square"> Edit Profile </i>
          </button>
        </div>
      </div>
      <div ref="customColRef" class="col-lg-9 col-12 custom-col mx-auto">
        <div class="container-fluid">
        <h3 style="padding-bottom: 10px">Your Listings</h3>
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
  </template>
  
  <script setup lang="ts">
  import gsap from 'gsap'
  import { ref, onMounted } from 'vue';
  import { db } from '../lib/firebaseConfig'; 
  import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
  import { useRoute } from 'vue-router';
  import Loading from "@/components/Loading.vue"; // Adjust the path as necessary
  
  const route = useRoute();
  const sellerId = route.params.sellerId as string;
  const userEmail = ref('');
  const name = ref('');
  const photoURL = ref('');
  const profileRef = ref<HTMLElement | null>(null);
  const customColRef = ref<HTMLElement | null>(null);
  const products = ref<any[]>([]);
  const isLoading = ref(true);

  const fetchUserData = async (uid: string) => {
    const userDoc = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userDoc);
  
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      userEmail.value = userData.email || '';
      name.value = userData.username || '';
      photoURL.value = userData.photoURL || '';
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
        localStorage.setItem('listing', JSON.stringify(fetchedProducts));
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
    height: 470px;
  }
  
  .profile-photo {
    margin-top: 15px;
    margin-bottom: 15px;
    text-align: center;
  }
  
  .profile-photo img {
    max-width: 100%;
    height: auto;
    border-radius: 50%;
  }
  
  .col-9{
    padding-right: 0px;
  }
  .card {
    margin-bottom: 20px;
    width: 400px;
  }
  
  .profile-photo img {
    max-width: 100%;
    height: auto;
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
    background-color: whitesmoke;
    border-radius: 20px;
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
  