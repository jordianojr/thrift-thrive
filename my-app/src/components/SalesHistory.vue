<template>
    <div class="container-fluid" style="padding-right: 130px; padding-left: 130px; padding-top: 40px;">
      <div>
          <Loading :isLoading="isLoading" message="Fetching your sales..." />
        </div>
        <div v-if="!isLoading">
          <div v-if="products.length === 0" style="padding-bottom: 20px;" class="no-container">
            <p>You have no sales yet.</p>
          </div>
        <div v-else class="row">
            <ul v-for="product in products" :key="product.id">
              <li>
                <h4 class="card-title">{{ product.itemName }}</h4>
                <h6 class="card-subtitle text-muted">Bought by: {{ product.buyerUserName }}</h6>
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
      const salesHistory = await getUserSalesHistory(uid); // Get order history for the user
      console.log('Sales History:', salesHistory);
  
      const fetchedProducts: any[] = [];
  
      // Fetch products based on the order history
      if (salesHistory && salesHistory.length > 0) {
        console.log('Sales History for Query:', salesHistory);
        const collectionRef = collection(db, "Sold");
  
        // Check Firestore limit for the 'in' query
        if (salesHistory.length > 10) {
          console.warn('Sales history exceeds Firestore limit for `in` queries. Truncating to 10 items.');
          salesHistory.length = 10; // Limit to 10 items for Firestore query
        }
  
        const q = query(collectionRef, where('id', 'in', salesHistory)); // Adjust based on actual field names
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
        console.log('Sales history is empty.');
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
  const getUserSalesHistory = async (uid: string) => {
    const salesHistory: string[] = [];
    try {
      const userDoc = doc(db, 'users', uid);
      const userSnapshot = await getDoc(userDoc);
  
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      if (userData.salesHistory) {
        salesHistory.push(...userData.salesHistory); // Assuming orderHistory is an array of product IDs
      }
    } 
    } catch (error) {
      console.error('Error fetching user sales history:', error);
    }
    return salesHistory;
  };
  
  // Fetch products when the component mounts
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
    .no-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px; /* Adjust this value based on your needs */
    }

    .no-container p {
      margin: 0;
      text-align: center;
    }
    </style>