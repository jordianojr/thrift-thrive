<template>
  <div class="category-section">
    <!-- Desktop Layout -->
    <div class="desktop-layout">
        <!-- Search Bar -->
      <div class="search-container section-group py-1">
        <div class="search-wrapper">
          <i class="bi bi-search search-icon"></i>
          <input
            v-model="filters.searchTerm"
            class="search-input"
            :placeholder="currentPlaceholder"
            :style="{ '--animation-opacity': isAnimating ? 0 : 1, '--animation-transform': isAnimating ? '60%' : '0' }"
            @keyup.enter="emitFilters"
          />
        </div>
      </div>
      <!-- Categories -->
      <div class="section-group">
        <div class="category-list">
          <button 
            v-for="cat in filteredCategories" 
            :key="cat" 
            class="sidebar-button"
            :class="{ 'selected': selectedCategory === cat }"
            @click="handleChoice(cat)"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Reset Button -->
       <div class="section-group">
        <button v-if="hasActiveFilters" @click="resetFilters" class="sidebar-button">
          Reset Filters
        </button>
        <text v-else style="font-size:1.1rem" class="sidebar-button">
          &nbsp;
        </text>
      </div>

      <!-- Filter Options -->
      <div class="section-group filters-list">

        <!-- Price Range Filter -->
        <div class="filter-group">
          <button 
            class="sidebar-button"
            :class="{ 'active': openFilters.includes('price') }"
            @click="toggleFilter('price')"
          >
            Price Range
          </button>
          <div v-if="openFilters.includes('price')" class="filter-options">
            <button 
              v-for="range in priceRanges"
              :key="range"
              class="option-button"
              :class="{ 'selected': filters.priceRange === range }"
              @click="toggleSubFilter('priceRange', range)"
            >
              {{ range }}
            </button>
          </div>
        </div>

        <!-- Condition Filter -->
        <div class="filter-group">
          <button 
            class="sidebar-button"
            :class="{ 'active': openFilters.includes('condition') }"
            @click="toggleFilter('condition')"
          >
            Condition
          </button>
          <div v-if="openFilters.includes('condition')" class="filter-options">
            <button 
              v-for="condition in conditions"
              :key="condition"
              class="option-button"
              :class="{ 'selected': filters.condition === condition }"
              @click="toggleSubFilter('condition', condition)"
            >
              {{ condition }}
            </button>
          </div>
        </div>

        <!-- Gender Filter -->
        <div class="filter-group">
          <button 
            class="sidebar-button"
            :class="{ 'active': openFilters.includes('gender') }"
            @click="toggleFilter('gender')"
          >
            Gender
          </button>
          <div v-if="openFilters.includes('gender')" class="filter-options">
            <button 
              v-for="option in genderOptions"
              :key="option"
              class="option-button"
              :class="{ 'selected': filters.gender === option }"
              @click="toggleSubFilter('gender', option)"
            >
              {{ option }}
            </button>
          </div>
        </div>

        <!-- Size Filter -->
        <div class="filter-group">
          <button 
            class="sidebar-button"
            :class="{ 'active': openFilters.includes('size') }"
            @click="toggleFilter('size')"
          >
            Size
          </button>
          <div v-if="openFilters.includes('size')" class="filter-options">
            <button 
              v-for="size in sizes"
              :key="size"
              class="option-button"
              :class="{ 'selected': filters.size === size }"
              @click="toggleSubFilter('size', size)"
            >
              {{ size }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>

    <!-- Mobile Layout -->
    <div class="mobile-layout">
      
      <div class="categories-row">
        <div class="search-container">
          <div class="search-wrapper">
            <i class="bi bi-search search-icon"></i>
            <input
              v-model="filters.searchTerm"
              class="search-input"
              placeholder="What are you looking for?"
              @keyup.enter="emitFilters"
            />
          </div>
        </div>
      </div>
      <!-- Categories Row -->
      <div class="categories-row scroll-container">
        <button 
          v-for="cat in filteredCategories" 
          :key="cat" 
          class="category-button"
          :class="{ 'selected': selectedCategory === cat }"
          @click="handleChoice(cat)"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Filters Row -->
      <div class="filters-row scroll-container">
        <button 
          v-if="hasActiveFilters"
          @click="resetFilters"
          class="reset-button-mobile"
        >
          Reset
        </button>
        <button 
          v-for="filterType in filterTypes"
          :key="filterType.id"
          class="filter-button"
          :class="{ 'active': openFilters.includes(filterType.id) }"
          @click="toggleFilter(filterType.id)"
        >
          {{ filterType.label }}
        </button>
      </div>

      <!-- Sub-Filters Row -->
      <div v-if="openFilters.length > 0" class="sub-filters-row">
        <div class="scroll-container">
        <div v-if="openFilters.includes('price')" class="sub-filters-group">
          <button 
            v-for="range in priceRanges"
            :key="range"
            class="sub-filter-button"
            :class="{ 'selected': filters.priceRange === range }"
            @click="toggleSubFilter('priceRange', range)"
          >
            {{ range }}
          </button>
        </div>
        <div v-if="openFilters.includes('condition')" class="sub-filters-group">
          <button 
            v-for="condition in conditions"
            :key="condition"
            class="sub-filter-button"
            :class="{ 'selected': filters.condition === condition }"
            @click="toggleSubFilter('condition', condition)"
          >
            {{ condition }}
          </button>
        </div>
        <div v-if="openFilters.includes('gender')" class="sub-filters-group">
          <button 
            v-for="option in genderOptions"
            :key="option"
            class="sub-filter-button"
            :class="{ 'selected': filters.gender === option }"
            @click="toggleSubFilter('gender', option)"
          >
            {{ option }}
          </button>
        </div>
        <div v-if="openFilters.includes('size')" class="sub-filters-group">
          <button 
            v-for="size in sizes"
            :key="size"
            class="sub-filter-button"
            :class="{ 'selected': filters.condition === size }"
            @click="toggleSubFilter('size', size)"
          >
            {{ size }}
          </button>
        </div>
        </div>
      </div>
    </div>
  
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, defineEmits, reactive } from 'vue';
const currentPlaceholder = ref('');
const currentIndex = ref(0);
const isAnimating = ref(false);
const placeholders = [
  'Dr. Martens',
  'Stüssy x Nike Shirt',
  'Crossbody Bags',
  'Corteiz Tanks',
  'Gentle Monster Shades'
];

let intervalId = 0;

const animatePlaceholder = () => {
  isAnimating.value = true;
  
  setTimeout(() => {
    currentIndex.value = (currentIndex.value + 1) % placeholders.length;
    currentPlaceholder.value = placeholders[currentIndex.value];
    isAnimating.value = false;
  }, 500);
};

onMounted(() => {
  currentPlaceholder.value = placeholders[0];
  intervalId = setInterval(animatePlaceholder, 3000);
});

onUnmounted(() => {
  clearInterval(intervalId);
});

interface Filters {
  searchTerm: string;
  priceRange: string;
  gender: string;
  condition: string;
  size: string;
}

const emit = defineEmits<{
  (e: 'categorySelected', category: string): void;
  (e: 'filtersChanged', filters: Filters): void;
}>();

const categories = ['Shoes', 'Accessories', 'Belt', 'T-shirt', 'Jeans', 'Outerwear'];
const conditions = ['Brand new', 'Like new', 'Lightly used', 'Well used', 'Heavily used'];
const priceRanges = ['$0 - $50', '$51 - $100', '$101 - $200', '$201+'];
const genderOptions = ['Male', 'Female', 'Unisex'];
const sizes = ['Free Size', 'XS', 'S', 'M', 'L', 'XL'];

const filterTypes = [
  { id: 'price', label: 'Price Range' },
  { id: 'condition', label: 'Condition' },
  { id: 'gender', label: 'Gender' },
  { id: 'size', label: 'Size' },
];

const openFilters = ref<string[]>([]);
const selectedCategory = ref('');

const filters = reactive<Filters>({
  searchTerm: '',
  priceRange: '',
  gender: '',
  condition: '',
  size: ''
});

const filteredCategories = computed(() => categories);

const hasActiveFilters = computed(() => {
  return filters.priceRange || filters.gender || filters.condition || filters.searchTerm || filters.size;
});

const toggleFilter = (filterType: string) => {
  const index = openFilters.value.indexOf(filterType);
  if (index === -1) {
    openFilters.value.push(filterType);
  } else {
    openFilters.value.splice(index, 1);
  }
};

const toggleSubFilter = (filterType: keyof Filters, value: string) => {
  if (filters[filterType] === value) {
    filters[filterType] = ''; // Deselect if clicking the same value
  } else {
    filters[filterType] = value; // Select new value
  }
  emitFilters();
};

const resetFilters = () => {
  filters.priceRange = '';
  filters.gender = '';
  filters.condition = '';
  filters.searchTerm = '';
  filters.size = '';
  openFilters.value = [];
  emitFilters();
};

const emitFilters = () => {
  emit('filtersChanged', { ...filters });
};

const handleChoice = (category: string) => {
  if (selectedCategory.value === category) {
    selectedCategory.value = ''; // Deselect if clicking the same category
  } else {
    selectedCategory.value = category; // Select new category
  }
  emit('categorySelected', selectedCategory.value);
};
</script>

<style scoped>
.search-input::placeholder {
  transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: var(--animation-opacity);
  transform: translateY(var(--animation-transform));
}

/* Desktop Styles */
.category-section {
  background-color: white;
  border-right: 1px black solid;
  height: 100%;
}

.desktop-layout {
  display: block;
}

.mobile-layout {
  display: none;
  background-color: white;
}

.search-container {
  margin-bottom: 0.1em;
}

.search-input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  font-size: 0.8rem;
  border: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s ease;
  text-transform: uppercase;
  color:black;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: black;
}

.search-input:focus {
  outline: none;
  border-bottom-color: black;
}

/* Desktop Layout Styles */
.section-group {
  margin-bottom: 2rem;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-button {
  background: none;
  border: none;
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 500;
  text-transform: uppercase;
  text-align: left;
  padding: 0.2rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
}

.filter-group {
  margin-bottom: 0.5rem;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-left: 1rem;
  margin-top: 0.3rem;
}

.option-button {
  background: none;
  border: none;
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 500;
  text-align: left;
  text-transform: uppercase;
  padding: 0.2rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
}

.reset-button {
  padding: 0.5rem 1rem;
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-family: 'Helvetica Neue', sans-serif;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* Mobile Layout Styles */

.mobile-layout .search-container {
  margin: 0;
  padding: 0;
}

.mobile-layout .search-input {
  width: 100%;
  padding: 0rem 1rem 0.3rem 1.5rem;
  font-size: 0.7rem;
  border: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s ease;
  text-transform: uppercase;
  color:black;
}

.mobile-layout .search-input:focus {
  outline: none;
  border-bottom-color: black;
}

.mobile-layout .search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin-top: 0.8rem;
}

.mobile-layout .search-icon {
  position: absolute;
  left: 0.1rem;
  padding-bottom: 0.3rem;
  color: black;
}

.scroll-container {
  display: flex;
  overflow-x: auto;
  gap: 0.1rem;
  padding: 0rem;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.scroll-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.categories-row,
.filters-row,
.sub-filters-row {
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  padding: 0.4rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.categories-row::-webkit-scrollbar,
.filters-row::-webkit-scrollbar,
.sub-filters-row::-webkit-scrollbar {
  display: none;
}

.category-button,
.filter-button,
.sub-filter-button {
  display: inline-block;
  padding: 0.2rem 0.3rem;
  margin-right: 0.2rem;
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-family: 'Helvetica Neue', sans-serif;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-button-mobile {
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  text-transform: uppercase;
  cursor: pointer;
}

/* Selected and Active States */
.selected,
.active,
.sidebar-button.selected,
.option-button.selected {
  color: green;
  border-color: green;
  text-decoration: underline;
}

/* Hover States */
.sidebar-button:hover,
.option-button:hover,
.category-button:hover,
.filter-button:hover,
.sub-filter-button:hover,
.reset-button:hover,
.reset-button-mobile:hover {
  color: green;
  border-color: green;
}

/* Mobile Breakpoint */
@media (max-width: 480px) {
  .desktop-layout {
    display: none;
  }

  .mobile-layout {
    display: block;
  }

  .category-section {
    padding: 0rem;
    margin: 0rem;
  }

  .categories-row, .filters-row, .sub-filters-row {
    border-bottom: 1px solid #e2e8f0;
  }

}
</style>