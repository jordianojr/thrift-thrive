<template>
    <div class="container-fluid">
      <h3 style="padding-bottom: 10px">Your Listings</h3>
      <div style="padding-bottom: 20px;">
        <Loading :isLoading="isLoading" message="Fetching your products..." />
      </div>
      <div v-if="!isLoading">
        <div v-if="products.length === 0" style="padding-bottom: 20px;">
          <p>You have no listing yet.</p>
          <router-link to="/sell" class="btn btn-dark">Sell Item</router-link>
        </div>
        <div v-else class="row">
          <div v-for="product in products" :key="product.id" class="col-lg-4 col-md-6 col-sm-12">
            <div class="card mb-4">
              <img :src="product.itemPhotoURLs" class="card-img-top img-fluid" alt="Product Image">
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
  import { getStorage, ref as storageRef, listAll, deleteObject } from 'firebase/storage';

  const products = ref<any[]>([]);
  const isLoading = ref(true);
  
  const fetchProducts = async () => {
    const uid = getUserUID();
    console.log(uid);
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
  
  const getUserUID = () => {
  if (auth.currentUser) {
    return auth.currentUser.uid;
  } else {
    alert('User is not logged in!');
    return null;
  }
};
  
const deleteItem = async (itemId: string) => {
  // Show confirmation dialog
  const confirmDelete = window.confirm("Are you sure you want to delete this item?");
  
  if (!confirmDelete) {
    // User chose "Cancel," exit the function
    return;
  }

  const collectionsToCheck = ['Shoes', 'Accessories', 'Belt', 'T-shirt', 'Jeans', 'Outerwear'];

  try {
    // Delete the item from Firestore
    for (const collectionName of collectionsToCheck) {
      const itemRef = doc(db, collectionName, itemId);
      await deleteDoc(itemRef);
    }

    // Delete the item's photos from Firebase Storage
    const photoPath = `item_photos/${itemId}`;
    await deleteFolder(photoPath);

    // Remove the item from the local products array
    products.value = products.value.filter(product => product.id !== itemId);
    localStorage.setItem('listing', JSON.stringify(products.value));

    alert('Item deleted successfully');
  } catch (error) {
    console.error('Error deleting item:', error);
    alert('Error deleting item');
  }
};
async function deleteFolder(folderPath: string | undefined) {
  const storage = getStorage();
  const folderRef = storageRef(storage, folderPath);

  try {
    // List all the files in the folder
    const { items } = await listAll(folderRef);

    // Delete each file in the folder
    for (const fileRef of items) {
      await deleteObject(fileRef);
    }

    // Delete the folder itself
    // await deleteObject(folderRef);

    console.log(`Folder ${folderPath} and all its contents have been deleted.`);
  } catch (error) {
    console.error('Error deleting folder:', error);
  }
}  
  onMounted(fetchProducts);
  </script>
  
  <style scoped>
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
  