<template>
    <div class="container-fluid">
      <input
        class = "inputBar"
        type="text"
        v-model="query"
        @input="onSearch"
        placeholder="Search..."
      />
      <button id = "buttonSearch" @click="submitSearch">Search</button>
    </div>
  </template>
  
  <script lang="ts">
  export default {
    data() {
      return {
        query: '',
      };
    },
    methods: {
      onSearch() {
        this.$emit('search', this.query);
      },
      submitSearch() {
        this.query = '';
        this.onSearch();
      },
    },
  };
  </script>
  
  <style scoped>
  .container-fluid{
    padding-bottom: 10px;
  }
  .inputBar {
    padding: 8px;
    margin-right: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 80vw;
    margin: auto;
  }
  #buttonSearch {
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    margin-left: 8px;
  }
  .container-fluid button:hover {
    background-color: #0056b3;
  }
  </style>
  