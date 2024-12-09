<template>
      <!-- for alerts popping in and out-->
      <CustomAlert :visible="showAlert" :message="alertMessage" :alert-type="alertType" :timeout="3000"
      @update:visible="showAlert = $event" />
      
    <div class="container-fluid" style="padding-top: 40px;">
      <div style="padding-bottom: 20px;">
        <Loading :isLoading="isLoading" message="Fetching your products..." />
      </div>
      <div v-if="!isLoading">
        <div v-if="products.length === 0" style="padding-bottom: 20px;">
          <p>You have no listing yet.</p>
          <router-link to="/sell" class="btn sell-btn">Sell Item</router-link>
        </div>
        <div v-else class="row">
          <div v-for="product in products" :key="product.id" class="col-lg-4 col-md-6 col-sm-6 col-12">
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
                <button type="button" class="btn btn-danger float-end" data-bs-toggle="modal" data-bs-target="#giveDeleteModal" @click="showDeleteModal(product.id)">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="giveDeleteModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="giveDeleteModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="giveDeleteModalLabel">
            <i class="bi bi-trash"></i> Confirm Delete?
          </h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          Are you sure you want to delete this item? This action cannot be undone.
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-danger" data-bs-dismiss="modal" @click="confirmDelete">Delete</button>
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
  import CustomAlert from '@/components/CustomAlert.vue';

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

  const products = ref<any[]>([]);
  const isLoading = ref(true);
  const router = useRouter();
  const productIdToDelete = ref<string | null>(null);

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
    const cachedData = localStorage.getItem(`user`);
    if (cachedData) {
    const userData = JSON.parse(cachedData);
    return userData.uid;
    } else {
    return auth.currentUser.uid;
    }
};

const editItem = (itemId: string) => {
  // Redirect to the EditItem page with the item ID as a route parameter
  router.push({ name: 'editItem', params: { id: itemId } });
  // console.log('Edit item with ID:', itemId);
};

function showDeleteModal(id: string) {
  productIdToDelete.value = id;
}

async function confirmDelete() {
  if (productIdToDelete.value) {
    await deleteItem(productIdToDelete.value);
    productIdToDelete.value = null; // Reset after deletion
  }
}

const deleteItem = async (itemId: string) => {

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

    //alert('Item deleted successfully');
    showCustomAlert('Item deleted successfully!', 'success');
  } catch (error) {
    console.error('Error deleting item:', error);
    //alert('Error deleting item');
    showCustomAlert('Error deleting item', 'error');
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
  .card-subtitle {
    font-family: 'Helvetica Neue', sans-serif;
    color: black;
    font-size: 0.875rem;
    font-weight: 300;
  }
  .card-text {
    font-family: 'Helvetica Neue', sans-serif;
    color: black;
    font-size: 0.875rem;
    font-weight: 300;
    height: 80px;
    overflow: scroll;
  }
  .card-title {
    display: flex;
    align-items: center;  
    justify-content: center;   /* Centers text horizontally */   
    font-weight: 400;
    text-transform: uppercase;
    color: black;
    font-size: 1.2rem;
    margin-bottom: 1rem;
    height: 100px;             /* Ensures container has height */
    text-align: center;        /* Optional for multi-line center alignment */
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

@media (min-width: 1200px) {
  .container-fluid {
    padding-left: 100px;
    padding-right: 100px;
  }
}

@media (max-width: 1200px) {
  .container-fluid {
    padding-left: 90px;
    padding-right: 90px;
  }
}

@media (max-width: 992px) {
  .container-fluid {
    padding-left: 60px;
    padding-right: 60px;
  }
}

@media (max-width: 768px) {
  .container-fluid {
    padding-left: 30px;
    padding-right: 30px;
  }
}

@media (max-width: 480px) {
  .container-fluid {
    padding-left: 10px;
    padding-right: 10px;
  }
}

  </style>
  