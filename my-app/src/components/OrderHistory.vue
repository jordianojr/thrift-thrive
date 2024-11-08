<template>
  <div class="container-fluid">
    <h3 style="padding-bottom: 10px;">Order History</h3>
    <div style="padding-bottom: 20px;">
        <Loading :isLoading="isLoading" message="Fetching your products..." />
      </div>
      <div v-if="!isLoading">
        <div v-if="products.length === 0" style="padding-bottom: 20px;">
          <p>You have no purchases yet.</p>
        </div>
      <div class="row">
          <ul v-for="product in products" :key="product.id">
            <li>
              <h4 class="card-title" style="font-size: 1.2rem;">{{ product.itemName }}</h4>
              <h6 class="card-subtitle text-muted" style="font-size: 1rem;">Sold by: {{ product.sellerUserName }}</h6>
            </li>
          </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import Loading from "@/components/Loading.vue"; // Adjust the path as necessary
import { db, auth } from "@/lib/firebaseConfig"; // Adjust the path as necessary
import { collection, getDocs, query, where, getDoc, doc } from "firebase/firestore";

const products = ref<any[]>([]);
const isLoading = ref(true);

// Function to fetch products based on order history
const fetchProducts = async () => {
  isLoading.value = true; // Set loading state to true
  const uid = getUserUID(); // Get user UID

  if (!uid) {
    console.warn('No UID found, user might not be logged in.');
    isLoading.value = false; // If no UID, set loading to false and return
    return;
  }

  try {
    const orderHistory = await getUserOrderHistory(uid); // Get order history for the user
    console.log('Order History:', orderHistory);

    const fetchedProducts: any[] = [];

    // Fetch products based on the order history
    if (orderHistory && orderHistory.length > 0) {
      console.log('Order History for Query:', orderHistory);
      const collectionRef = collection(db, "Sold");

      // Check Firestore limit for the 'in' query
      if (orderHistory.length > 10) {
        console.warn('Order history exceeds Firestore limit for `in` queries. Truncating to 10 items.');
        orderHistory.length = 10; // Limit to 10 items for Firestore query
      }

      const q = query(collectionRef, where('id', 'in', orderHistory)); // Adjust based on actual field names
      const querySnapshot = await getDocs(q);
      console.log('Query Snapshot:', querySnapshot);

      if (querySnapshot.empty) {
        console.log('No matching products found in the Sold collection.');
      } else {
        querySnapshot.forEach((doc) => {
          fetchedProducts.push({ id: doc.id, ...doc.data() });
        });
      }
    } else {
      console.log('Order history is empty.');
    }

    products.value = fetchedProducts;  // Assign fetched products to the reactive variable
    console.log('Fetched Products:', products.value);
  } catch (error) {
    console.error('Error fetching products:', error);
  } finally {
    isLoading.value = false; // Set loading state to false
  }
};
// Function to get the current user's UID
const getUserUID = () => {
  return auth.currentUser ? auth.currentUser.uid : null; // Return user UID directly
};

// Function to get the order history for the current user
const getUserOrderHistory = async (uid: string) => {
  const orderHistory: string[] = [];
  try {
    const userDoc = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userDoc);

  if (userSnapshot.exists()) {
    const userData = userSnapshot.data();
    if (userData.orderHistory) {
      orderHistory.push(...userData.orderHistory); // Assuming orderHistory is an array of product IDs
    }
  } 
  } catch (error) {
    console.error('Error fetching user order history:', error);
  }
  return orderHistory;
};

// Fetch products when the component mounts
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
  