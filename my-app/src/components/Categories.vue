<template>
  <div class="category-section">
    <h5 class="title">What are you looking for today?</h5>
    
    <div class="row">
      <div v-if="isDropdown" class="dropdown-container">
        <select @change="handleCategoryChange" class="dropdown-select">
          <option value="" disabled selected>Select a category</option>
          <option
            v-for="cat in filteredCategories"
            :key="cat"
            :value="cat"
          >{{ cat }}</option>
        </select>
      </div>
      <div v-else class="grid-container">
        <button 
          v-for="cat in filteredCategories" 
          :key="cat" 
          class="category-card"
          @click="handleChoice(cat)"
        >
          <span class="category-icon">{{ getCategoryIcon(cat) }}</span>
          <span class="category-name">{{ cat }}</span>
        </button>
      </div>
    </div>
    <div style="margin: 30px 0px">
      <h5 style="color:black">Refine your search</h5>
    </div>
    <div class="filters-container">
      <!-- Search Input with Button -->
      <div class="filter-group search-group">
        <input
          v-model="filters.searchTerm"
          class="filter-input"
          placeholder="Search keywords..."
        />
      </div>

      <!-- Price Range Filter -->
      <div class="filter-group">
        <select 
          v-model="filters.priceRange" 
          class="filter-select"
        >
          <option disabled value="">Price Range</option>
          <option value="0-50">$0 - $50</option>
          <option value="51-100">$51 - $100</option>
          <option value="101-200">$101 - $200</option>
          <option value="201+">$201+</option>
        </select>
      </div>

      <div class="filter-group">
        <select 
          v-model="filters.gender" 
          class="filter-select"
        >
          <option disabled value="">Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Unisex">Unisex</option>
        </select>
      </div>
      <!-- Size Filter -->
      <div class="filter-group">
        <select 
          v-model="filters.condition" 
          class="filter-select"
        >
          <option disabled value="">Condition</option>
          <option v-for="c in conditions" :key="c" :value="c">
            {{ c }}
          </option>
        </select>
      </div>
    </div>
    <button 
          @click="emitFilters"
          class="search-button"
        >
          Apply Filters
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, defineEmits, reactive } from 'vue';

interface Filters {
  searchTerm: string;
  priceRange: string;
  gender: string;
  condition: string;
}

const emit = defineEmits<{
  (e: 'categorySelected', category: string): void;
  (e: 'filtersChanged', filters: Filters): void;
}>();

const categories = ['Shoes', 'Accessories', 'Belt', 'T-shirt', 'Jeans', 'Outerwear'];
const isDropdown = ref(false);
const conditions = ['Brand new', 'Like new', 'Lightly used', 'Well used', 'Heavily used'];

// Reactive filters object
const filters = reactive<Filters>({
  searchTerm: '',
  priceRange: '',
  gender: '',
  condition: '',
});

// Computed property to filter categories based on search term
const filteredCategories = computed(() => categories);

// Function to emit filter changes to parent
const emitFilters = () => {
  emit('filtersChanged', { ...filters });
  filters.searchTerm = ''; // Clear search term after emitting
  filters.priceRange = ''; // Clear price range after emitting
  filters.gender = ''; // Clear
  filters.condition = ''; // Clear condition after emitting
};

// Function to emit the selected category
const handleCategoryChange = (event: Event) => {
  const selectedCategory = (event.target as HTMLSelectElement).value;
  emit('categorySelected', selectedCategory);
};

const handleChoice = (category: string) => {
  emit('categorySelected', category);
};

// Function to return emoji icons for categories
const getCategoryIcon = (category: string): string => {
  const icons: { [key: string]: string } = {
    'Shoes': '👟',
    'Bags': '👜',
    'Accessories': '🕶️',
    'T-shirt': '👕',
    'Jeans': '👖',
    'Outerwear': '🧥'
  };
  return icons[category] || '🛍️';
};

// Reactive property to check screen width
const updateLayout = () => {
  isDropdown.value = window.innerWidth < 1180;
};

// Update layout on resize
window.addEventListener('resize', updateLayout);
updateLayout(); // Initial check on component mount
</script>

<style scoped>
.search-group {
  display: flex;
  gap: 8px;
}

.search-button {
  padding: 8px 16px;
  background-color: #4a5568;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-button:hover {
  background-color: #2d3748;
}
.category-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.title {
  font-size: 1.8rem;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 600;
}

.filters-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.filter-group {
  width: 100%;
}

.filter-input,
.filter-select {
  width: 100%;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background-color: #ffffff;
  color: #2c3e50;
  transition: all 0.3s ease;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.filter-input::placeholder {
  color: #a0aec0;
}

.row {
  display: flex;
  justify-content: center;
  width: 100%;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 150px;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  border-color: #3498db;
}

.category-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.category-name {
  font-size: 1.1rem;
  font-weight: 500;
  color: #2c3e50;
}

.dropdown-container {
  width: 100%;
  max-width: 300px;
}

.dropdown-select {
  width: 100%;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background-color: #ffffff;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .title {
    font-size: 1.5rem;
  }
  
  .filters-container {
    grid-template-columns: 1fr;
  }
  
  .grid-container {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
  
  .category-card {
    padding: 1.5rem;
    min-height: 150px;
  }
  
  .category-icon {
    font-size: 2rem;
  }
  
  .category-name {
    font-size: 1rem;
  }
}
</style>