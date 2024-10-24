<template>
        <h2>Trending Kicks</h2>
        <Loading :isLoading="isLoading" message="Fetching your products..." />
        <div v-if="!isLoading">
        <div id="productCarousel" class="carousel slide" data-bs-ride="carousel">
          <div class="carousel-inner">
            <div class="carousel-item" v-for="(item, index) in groupedProducts" :key="index" :class="{ active: index === 0 }">
                <div class="row justify-content-center">
                    <div v-for="product in item" :key="product.id" class="col-lg-3 col-md-4 col-sm-6">
                        <div class="card mb-4" @click="clickMe(product.name)">
                            <img :src="product.image" class="card-img-top" alt="Product Image">
                            <div class="card-body">
                                <h5 class="card-title">{{ product.name }}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">${{ product.price }}</h6>
                                <p class="card-text">{{ product.seller }}</p>
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

const products = ref<any[]>([]); // Adjust the type as needed
const groupSize = ref(0); // Initialize reactive groupSize
const isLoading = ref(true);

const fetchProducts = async () => {
  // Check local storage first
  const cachedProducts = localStorage.getItem('products');
  if (cachedProducts) {
    isLoading.value = false;
    products.value = JSON.parse(cachedProducts);
    return;
  }

  try {
    const querySnapshot = await getDocs(collection(db, 'shoes'));
    const fetchedProducts: any[] = [];
    querySnapshot.forEach((doc) => {
      fetchedProducts.push({ id: doc.id, ...doc.data() });
    });
    products.value = fetchedProducts;

    // Cache products in local storage
    localStorage.setItem('products', JSON.stringify(fetchedProducts));
    isLoading.value = false;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

// Function to determine the group size based on window size
const getGroupSize = () => {
  if (window.innerWidth >= 992) { // md size and up
    return 4;
  } else if (window.innerWidth >= 768){
    return 3;
  } else if (window.innerWidth >= 576){ // sm size
    return 2;
  } else {
    return 1
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

function clickMe(name: any) {
  alert(name + " is chosen");
}

// Fetch products on component mount
onMounted(fetchProducts);
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
}

#productCarousel {
  padding-top: 10px;
}
</style>


  