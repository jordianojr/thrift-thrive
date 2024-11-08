<template>
  <div class="products-container">
    <header class="header-section">
      <h3 class="category-title">{{ categoryChosen || 'All Products' }}</h3>
    </header>

    <div v-if="isLoading">
      <Loading :isLoading="isLoading" message="Fetching products..." />
    </div>
    <div v-else-if="filteredProducts.length > 0" class="products-grid">
      <div v-for="product in filteredProducts" 
           :key="product.id" 
           class="product-card"
           @click="navigateToItem(product)">
        <div class="product-image-container">
          <img :src="getProductImage(product)" 
               class="product-image" 
               :alt="product.itemName"
               loading="lazy" />
        </div>
        <div class="product-content">
          <h4 class="product-title">{{ product.itemName }}</h4>
          <div class="product-price">${{ formatPrice(product.itemPrice) }}</div>
          <div class="seller-name">{{ product.userName }}</div>
        </div>
      </div>
    </div>

    <div v-else-if="!isLoading" class="no-results">
      <p class="noproducts">No matching results. Please try a different search.</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, onMounted, watch, computed } from 'vue';
import { db } from '@/lib/firebaseConfig';
import { collection, getDocs, QueryDocumentSnapshot } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { useRouter, useRoute } from 'vue-router';
import Loading from '@/components/Loading.vue';

interface Product {
  id: string;
  itemName: string;
  itemPrice: number;
  itemPhotoURLs: string[] | string;
  userName: string;
  description: string;
  size?: string;
  condition?: string;
  brand?: string;
  gender?: string;
}

interface Filters {
  searchTerm: string;
  priceRange: string;
  size: string;
  gender: string;
  condition: string;
}
const route = useRoute();
const router = useRouter();
const searchBarTerm = route.params.searchTerm as string || '';
const routeGender = route.params.gender as string || '';
const props = defineProps<{
  categoryChosen: string;
  activeFilters: Filters;
}>();

const isLoading = ref(true);
const products = ref<Product[]>([]);
const categories = ['Shoes', 'Accessories', 'Belt', 'T-shirt', 'Jeans', 'Outerwear'];

// Computed property to check if any filters are active
const hasActiveFilters = computed(() => {
  return Object.values(props.activeFilters).some(value => value !== '');
});

// Computed property for filtered products
const filteredProducts = computed(() => {
  let filtered = [...products.value];

  if (searchBarTerm) {
    const searchLower = searchBarTerm.toLowerCase();
    filtered = filtered.filter(product => 
      product.itemName.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower)
    );
  }
  // Apply search term filter
  if (props.activeFilters.searchTerm) {
    const searchLower = props.activeFilters.searchTerm.toLowerCase();
    filtered = filtered.filter(product => 
      product.itemName.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower)
    );
  }
  // Apply price range filter
  if (props.activeFilters.priceRange) {
  const range = props.activeFilters.priceRange;
  let min = 0;
  let max = Infinity;

  if (range === '$201+') {
    min = 201;
  } else {
    // Remove '$' symbols and split by '-'
    const [minStr, maxStr] = range.split('-')
      .map(str => str.trim().replace('$', ''));
    
    min = parseInt(minStr);
    max = parseInt(maxStr);
  }

  filtered = filtered.filter(product => {
    const price = Number(product.itemPrice);
    return price >= min && price <= max;
  });
}

  // Apply condition filter
  if (props.activeFilters.condition) {
    filtered = filtered.filter(product => product.condition === props.activeFilters.condition);
  }

  // Apply gender filter
  if (props.activeFilters.gender) {
    filtered = filtered.filter(product => product.gender === props.activeFilters.gender);
  }

  // Apply size filter
  if (props.activeFilters.size) {
    filtered = filtered.filter(product => product.size === props.activeFilters.size);
  }

  return filtered;
});

// Function to fetch products from Firestore
const fetchProducts = async () => {
  if (props.categoryChosen) {
    isLoading.value = true;
    try {
      const querySnapshot = await getDocs(collection(db, props.categoryChosen));
      products.value = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      console.log(products.value);
    } catch (error) {
      console.error('Error fetching products:', error);
      products.value = [];
    } finally {
      isLoading.value = false;
    }
  } else {
    products.value = [];
    isLoading.value = true;
    console.log(routeGender, searchBarTerm);

    try {
      const allProducts: Product[] = [];
      for (const category of categories) {
        const querySnapshot = await getDocs(collection(db, category));
        const categoryProducts = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          ...doc.data()
        } as Product));
        allProducts.push(...categoryProducts);
      }
      products.value = allProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
      products.value = [];
    } finally {
      isLoading.value = false;
    }
  }
};


const formatPrice = (price: number) => {
  return price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};


const getProductImage = (product: Product) => {
  if (Array.isArray(product.itemPhotoURLs)) {
    return product.itemPhotoURLs[0] || '/placeholder-image.jpg';
  }
  return product.itemPhotoURLs || '/placeholder-image.jpg';
};


const navigateToItem = (product: Product) => {
  router.push({ 
    name: 'item', 
    params: { 
      category: props.categoryChosen, 
      id: product.id 
    } 
  });
};

// Watch for changes in category or filters
watch(() => props.categoryChosen, fetchProducts);
watch(() => props.activeFilters, () => {}, { deep: true });

// Initial fetch
onMounted(fetchProducts);

// Define emits
const emit = defineEmits<{
  (e: 'updateFilters', filters: Filters): void;
}>();
</script>

<style scoped>
.products-container {
  max-width: 1400px;
  margin: 0 auto;
  margin-bottom: 4rem;
}

.header-section {
  padding-bottom: 40px;
  margin-bottom: 2.5rem;
  border-bottom: black solid 1px;
}

.category-title {
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  text-align: right;
  font-size: 1.9rem;
  color: black;
  margin-bottom: 1.1rem;
  margin-right: 40px;
}

.noproducts{
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 400;
  /* text-transform: uppercase; */
  text-align: center;
  font-size: 0.95rem;
  color: black;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  padding-left: 40px;
  padding-right: 40px;
}

.product-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  will-change: transform;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-image-container {
  position: relative;
  padding-top: 75%;
  height: 400px;
  overflow: hidden;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  will-change: transform;
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.view-details {
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border: 2px solid white;
  border-radius: 2rem;
  transform: translateY(10px);
  transition: transform 0.3s ease;
}

.product-card:hover .view-details {
  transform: translateY(0);
}

.product-content {
  padding: 1.5rem;
}

.product-title {
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  text-align: center;
  font-size: 0.8rem;
  color: black;
}

.product-price {
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 400;
  text-transform: uppercase;
  text-align: center;
  font-size: 0.8rem;
  color: black;
}

.seller-name {
  color: rgb(79, 79, 79);
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 400;
  text-transform: uppercase;
  text-align: center;
  font-size: 0.8rem;
  margin-top: 1rem;
}

.no-results {
  text-align: center;
  padding: 3rem;
  color: rgb(79, 79, 79);
  font-size: 1.125rem;
}

/* Loading state styles */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

@media (max-width: 768px) {
  .header-section {
    padding-bottom: 0px;
    margin-bottom: 0rem;
    border: none;
  }

  .products-container {
    padding: 1rem;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
    padding: 0;
  }

  .category-title {
    font-size: 1.5rem;
  }

  .product-title {
    font-size: 1.125rem;
  }

  .product-price {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .header-section {
    padding-bottom: 0px;
    margin-bottom: 2.5rem;
    border: none;
  }

  .products-container {
    padding: 0.75rem;
    margin-right: 0; /* Remove right margin for better mobile layout */
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr); /* Force 2 columns */
    gap: 0.75rem; /* Slightly reduced gap for tighter mobile layout */
    padding: 0;
  }

  .product-image-container {
    height: 200px; /* Reduced height for better mobile proportions */
  }

  .product-content {
    padding: 1rem; /* Reduced padding for mobile */
  }

  .product-title {
    font-size: 0.75rem; /* Smaller font size for mobile */
  }

  .product-price {
    font-size: 0.75rem;
  }

  .seller-name {
    font-size: 0.7rem;
    margin-top: 0.5rem;
  }
}
</style>