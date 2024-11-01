<template>
    <section class="content">
        <Categories @categorySelected="parseData"/>
    </section>

    <section>
      <MarketplaceDisplay :categoryChosen="categoryChosen"/>
    </section>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Categories from '../components/Categories.vue';
import MarketplaceDisplay from '@/components/MarketplaceDisplay.vue';

const categoryChosen = ref('');

const parseData = (selectedCategory: string) => {
    categoryChosen.value = selectedCategory;
    // Add your logic to handle the selected category here
};
</script>

<style scoped>
.content {
  padding: 20px;
  text-align: center;
  color: black;
}
</style>