<template>
  <div class="category-section">
    <h4 class="title">What are you looking for today?</h4>
    <div class="row">
      <div v-if="isDropdown" class="dropdown-container">
        <select 
          @change="handleCategoryChange"
          class="dropdown-select"
        >
          <option value="" disabled selected>Select a category</option>
          <option 
            v-for="cat in categories" 
            :key="cat" 
            :value="cat"
          >{{ cat }}</option>
        </select>
      </div>
      <div v-else class="grid-container">
        <button 
          v-for="cat in categories" 
          :key="cat" 
          class="category-card"
          @click="handleChoice(cat)"
        >
          <span class="category-icon">{{ getCategoryIcon(cat) }}</span>
          <span class="category-name">{{ cat }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineEmits } from 'vue';

const emit = defineEmits(['categorySelected']);
const categories = ['Shoes', 'Accessories', 'Belt', 'T-shirt', 'Jeans', 'Outerwear'];
const isDropdown = ref(false);

// Function to handle category change
const handleCategoryChange = (event: Event) => {
  const selectedCategory = (event.target as HTMLSelectElement).value;
  emit('categorySelected', selectedCategory);
};

const handleChoice = (category: string) => {
  const selectedCategory = category;
  console.log('Selected category:', selectedCategory);
  emit('categorySelected', selectedCategory);
};

// Function to return emoji icons for categories
const getCategoryIcon = (category: string): string => {
  const icons: { [key: string]: string } = {
    'Shoes': '👟',
    'Bags': '👜',
    'Accessories': '🕶️💍',
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

.row {
  display: flex;
  justify-content: center;
  width: 100%;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 1000px;
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
  min-height: 180px;
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

.dropdown-select:hover {
  border-color: #3498db;
}

.dropdown-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

@media (max-width: 768px) {
  .title {
    font-size: 1.5rem;
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