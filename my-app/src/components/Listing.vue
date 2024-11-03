<template>
    <div class="container-fluid">
      <h3 style="padding-bottom: 10px">Your Listings</h3>
      <Loading :isLoading="isLoading" message="Fetching your products..." />
      <div v-if="!isLoading">
        <div class="row">
          <div v-for="product in products" :key="product.id" class="col-lg-4 col-md-6 col-sm-12">
            <div class="card mb-4">
              <img :src="product.itemPhotoURLs[0]" class="card-img-top img-fluid" alt="Product Image">
              <div class="card-body">
                <h4 class="card-title">{{ product.itemName }}</h4>
                <h5 class="card-subtitle mb-2 text-muted">${{ product.itemPrice }}</h5>
                <h6 class="card-subtitle">{{ product.seller }}</h6>
                <p class="card-text">{{ product.description }}</p>
                <button class="btn btn-danger float-end" @click="deleteItem(product.id)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, onMounted } from "vue";
  import Loading from "@/components/Loading.vue"; // Adjust the path as necessary
  import { db, auth, storage } from "@/lib/firebaseConfig"; // Adjust the path as necessary
  import { collection, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
  import { ref as storageRef, deleteObject } from 'firebase/storage';
  
  const products = ref<any[]>([]);
  const isLoading = ref(true);
  
  const fetchProducts = async () => {
    const uid = getUserUID();
    const cachedProducts = localStorage.getItem('listing');
  
    if (cachedProducts) {
      products.value = JSON.parse(cachedProducts);
    } else {
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
    }
    isLoading.value = false;
  };
  
  const getUserUID = () => {
    return auth.currentUser ? auth.currentUser.uid : null;
  };
  
  const deleteItem = async (itemId: string) => {
    const collectionsToCheck = ['Shoes', 'Accessories', 'Belt', 'T-shirt', 'Jeans', 'Outerwear'];
  
    try {
      for (const collectionName of collectionsToCheck) {
        const itemRef = doc(db, collectionName, itemId);
        await deleteDoc(itemRef);
      }
  
      const photoPath = `item_photos/${itemId}`;
      const photoRef = storageRef(storage, photoPath);
      await deleteObject(photoRef);
  
      products.value = products.value.filter(product => product.id !== itemId);
      localStorage.setItem('listing', JSON.stringify(products.value));
      alert('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    }
  };
  
  onMounted(fetchProducts);
  </script>
  
  <style scoped>
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
  