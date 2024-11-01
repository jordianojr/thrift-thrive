<template>
  <section class="content">
      <Categories 
        @categorySelected="parseData" 
        @filtersChanged="handleFilters"
      />
  </section>

  <section>
    <MarketplaceDisplay 
      :categoryChosen="categoryChosen"
      :activeFilters="activeFilters"
    />
  </section>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Categories from '../components/Categories.vue';
import MarketplaceDisplay from '@/components/MarketplaceDisplay.vue';

interface Filters {
searchTerm: string;
priceRange: string;
size: string;
}

const categoryChosen = ref('');
const activeFilters = ref<Filters>({
searchTerm: '',
priceRange: '',
size: ''
});

const parseData = (selectedCategory: string) => {
  categoryChosen.value = selectedCategory;
};

const handleFilters = (filters: Filters) => {
  activeFilters.value = filters;
  // Add your logic to handle the filters here (e.g., API calls, filtering data)
  console.log('Active filters:', filters);
};
</script>
<style scoped>
.content {
  text-align: center;
  color: white;
}
</style>