<template>
        <h2>You may like:</h2>
        <Loading :isLoading="isLoading" message="Fetching your products..." />
        <div v-if="!isLoading">
        <div id="productCarousel" class="carousel slide" data-bs-ride="carousel">
          <div class="carousel-inner">
            <div class="carousel-item" v-for="(item, index) in groupedProducts" :key="index" :class="{ active: index === 0 }">
                <div class="row justify-content-center">
                    <div v-for="product in item" :key="product.id" class="col-lg-3 col-md-4 col-sm-6">
                        <div class="card mb-4" @click="navigateToItem(product)">
                            <img :src="product.itemPhotoURLs[0]" class="card-img-top" alt="Product Image">
                            <div class="card-body">
                                <h5 class="card-title">{{ product.itemName }}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">${{ product.itemPrice }}</h6>
                                <p style="color: black;" class="card-text">{{ product.userName }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
          <button class="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Previous</span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Next</span>
          </button>
        </div>
        </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { db } from "@/lib/firebaseConfig"; // Adjust the path as necessary
import { collection, getDocs } from "firebase/firestore";
import Loading from "@/components/Loading.vue"; // Adjust the path as necessary
import { useRouter } from 'vue-router'; // Import useRouter from Vue Router

const router = useRouter(); // Initialize the router

const products = ref<any[]>([]); // Adjust the type as needed
const groupSize = ref(0); // Initialize reactive groupSize
const isLoading = ref(true);
const categoryList = ['Shoes', 'Accessories', 'Belt', 'T-shirt', 'Jeans', 'Outerwear'];
const displayCategory = categoryList[Math.floor(Math.random() * categoryList.length)];

const fetchProducts = async () => {
  try {
    console.log('Fetching products...' + displayCategory);
    const querySnapshot = await getDocs(collection(db, displayCategory));
    const fetchedProducts: any[] = [];
    querySnapshot.forEach((doc) => {
      fetchedProducts.push({ id: doc.id, ...doc.data() });
    });

    products.value = fetchedProducts;
    isLoading.value = false;
    console.log(fetchedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    isLoading.value = false; // Ensure loading state is updated even on error
  }
};

// Function to determine the group size based on window size
const getGroupSize = () => {
  if (window.innerWidth >= 992) { // md size and up
    return 4;
  } else if (window.innerWidth >= 768) {
    return 3;
  } else if (window.innerWidth >= 576) { // sm size
    return 2;
  } else {
    return 1;
  }
};

// Set initial group size
groupSize.value = getGroupSize();

// Update groupSize on window resize
const updateGroupSize = () => {
  groupSize.value = getGroupSize();
};

// Add event listeners for resize
onMounted(() => {
  window.addEventListener('resize', updateGroupSize);
  fetchProducts(); // Fetch products on mount
});

// Cleanup event listener on component unmount
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateGroupSize);
});

// Group products based on the determined size
const groupedProducts = computed(() => {
  const groups: any[][] = [];
  
  for (let i = 0; i < products.value.length; i += groupSize.value) {
    groups.push(products.value.slice(i, i + groupSize.value));
  }
  return groups;
});

// Function to navigate to Item.vue with the product details
function navigateToItem(product: any) { 
  router.push({ name: 'item', params: { category: displayCategory, id: product.id } }); 
}
</script>

<style scoped>
.card-img-top {
  width: 100%; /* Make the image responsive */
  height: 300px; /* Set a fixed height to maintain card size */
  object-fit: cover; /* Ensure the image covers the area without distortion */
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
#productCarousel {
  padding-top: 10px;
}
.card {
  /* Other styles for .card */
  transition: transform 0.2s; /* Optional: adds a smooth scaling effect */
}

.card:hover {
  cursor: pointer; /* Changes cursor to a pointer when hovering */
  transform: scale(1.05); /* Optional: scales up slightly on hover */
}
</style>


  