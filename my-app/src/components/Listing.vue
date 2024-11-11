<template>
    <div class="container-fluid" style="padding-right: 130px; padding-left: 130px; padding-top: 40px;">
      <div style="padding-bottom: 20px;">
        <Loading :isLoading="isLoading" message="Fetching your products..." />
      </div>
      <div v-if="!isLoading">
        <div v-if="products.length === 0" style="padding-bottom: 20px;">
          <p>You have no listing yet.</p>
          <router-link to="/sell" class="btn sell-btn">Sell Item</router-link>
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
                <button class="btn float-start" style="background-color: white;" @click="editItem(product.id)">
                  <i class="bi bi-pencil-square"></i>
                </button>
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
  import { useRouter } from "vue-router";

  const products = ref<any[]>([]);
  const isLoading = ref(true);
  const router = useRouter();

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

const editItem = (itemId: string) => {
  // Redirect to the EditItem page with the item ID as a route parameter
  router.push({ name: 'editItem', params: { id: itemId } });
  // console.log('Edit item with ID:', itemId);
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
    border-radius: 10px;
    padding-top: 15px;
  }
  .card-subtitle, .card-text {
    font-family: 'Helvetica Neue', sans-serif;
    color: black;
    font-size: 0.875rem;
    font-weight: 300;
  }
  .card-title{
      font-weight: 400;
      text-transform: uppercase;
      color: black;
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }

  .card-img-top {
    width: 100%;
    height: 250px;
    object-fit: cover;
    aspect-ratio: 3/4;
  }

  .sell-btn {
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
  width: 100%;
  padding-top: 7px;
  padding-bottom:7px;
}

.sell-btn:hover {
  color: black !important;
  background-color: white !important;
  border: black 1px solid !important;
}
  </style>
  