<template>
  <div class="desktop-layout">
  <div class="marketplace-layout">
    <section class="sidebar-section">
      <Categories
        @categorySelected="parseData"
        @filtersChanged="handleFilters"
      />
    </section>
    <section class="display-section">
      <MarketplaceDisplay
        :categoryChosen="categoryChosen"
        :activeFilters="activeFilters"
      />
    </section>
  </div>
  </div>

  <div class="mobile-layout">
  <div class="marketplace-layout">
    <section class="sidebar-section sticky-categories">
      <Categories
        @categorySelected="parseData"
        @filtersChanged="handleFilters"
      />
    </section>
    <section class="display-section">
      <MarketplaceDisplay
        :categoryChosen="categoryChosen"
        :activeFilters="activeFilters"
      />
    </section>
    </div>
  </div>

</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Categories from '../components/Categories.vue';
import MarketplaceDisplay from '@/components/MarketplaceDisplay.vue';

interface Filters {
  searchTerm: string;
  priceRange: string;
  size: string;
  gender: string;
  condition: string;
}

const categoryChosen = ref('');
const activeFilters = ref<Filters>({
  searchTerm: '',
  priceRange: '',
  size: '',
  gender: '',
  condition: ''
});

const parseData = (selectedCategory: string) => {
  categoryChosen.value = selectedCategory;
};

const handleFilters = (filters: Filters) => {
  activeFilters.value = filters;
  console.log('Active filters:', filters);
};
</script>

<style scoped>
.marketplace-layout {
  display: flex;
  min-height: 100vh;
  color: white;
}

.sidebar-section {
  flex: 0 0 220px;
}

.display-section {
  flex: 1;
  padding: 0rem;
}

.desktop-layout {
  display: block;
}

.mobile-layout {
  display: none;
}

@media (max-width: 480px) {
  .desktop-layout {
    display: none;
  }

  .mobile-layout {
    display: block;
  }
  .mobile-layout .marketplace-layout {
    flex-direction: column; /* Stack children vertically */
  }

  .mobile-layout .sidebar-section {
    flex: none; /* Remove the fixed width */
    width: 100%; /* Take full width */
  }

  .mobile-layout .display-section {
    width: 100%;
  }

  .sticky-categories {
    position: sticky;
    top: 75px;
    background: inherit; /* Ensures background matches your theme */
    width: 100%;
    z-index:10;
    height: fit-content;
  }
  
}
</style>