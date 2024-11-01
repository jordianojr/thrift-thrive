<template>
    <div class="row">
      <div class="col-12 col-lg-9 col-xl-9 col-xxl-9" style="margin-bottom: 20px;">
        <div ref="mapContainer" class="map-container"></div>
      </div>
      <div class="col-12 col-lg-3 col-xl-3 col-xxl-3" v-if="firstClick">
        <InfoCard :placeChosen="placeChosen" />
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import loadGoogleMaps from '@/lib/googleMaps';
  import InfoCard from '@/components/InfoCard.vue'; // Adjust the import path based on your project structure
  
  const placeChosen = ref(''); // This will be passed to InfoCard
  const firstClick = ref(false);
  // Example array of marker locations
  const markerLocations = [
    { lat: 1.2956, lng: 103.8542, title: 'Haji Lane, Singapore' }, // Haji Lane

    {lat: 1.3056, lng: 103.9043, title: "The Barn @ Katong"},

    {lat: 1.2811, lng: 103.8458, title: "Function Five Thrift Shop"},

    {lat: 1.2749, lng: 103.8418, title: "The Fashion Pulpit"},

    {lat: 1.3042, lng: 103.8322, title: "LPB Thrift"},

    {lat: 1.3039, lng: 103.8328, title: "Lucky Thrifty"},

    {lat: 1.3155, lng: 103.8844, title: "Preloved Thrift Shop"},

    {lat: 1.2927, lng: 103.8510, title: "Cherry Thrift Shop"},

    {lat: 1.3135, lng: 103.8608, title: "Refash"},

    {lat: 1.2929, lng: 103.8581, title: "Nightingale Thrift Shop"},

    {lat: 1.3024, lng: 103.8398, title: "SSVP Shop"},

    {lat: 1.3693, lng: 103.8494, title: "MINDS Shop"},

    {lat: 1.2990, lng: 103.8547, title: "New2U Thrift Shop"},

    {lat: 1.3015, lng: 103.8580, title: "Flame Vintage"},

    {lat: 1.2931, lng: 103.8558, title: "Style Tribute"},

    {lat: 1.2903, lng: 103.8048, title: "Daisy’s Yard"},

    {lat: 1.3065, lng: 103.9029, title: "A Vintage Tale"},

    {lat: 1.3138, lng: 103.8551, title: "Refash"},

    {lat: 1.3483, lng: 103.9355, title: "Something Old, Something New"},

    {lat: 1.3039, lng: 103.8345, title: "Shop+ (Red Cross)"},

    {lat: 1.3070, lng: 103.8560, title: "Loop Garms"},

    {lat: 1.3040, lng: 103.8315, title: "Lucky Plaza Bazaar"}
  ];
  
  const mapContainer = ref<HTMLElement | null>(null); // Create a ref for the map container
  let currentInfoWindow: google.maps.InfoWindow | null = null; // Track the currently open info window
  
  const initMap = () => {
    if (!mapContainer.value) return; // Ensure the ref is not null
  
    const mapOptions: google.maps.MapOptions = {
      center: { lat: 1.2956, lng: 103.8542 }, // Set the initial center to Haji Lane, Singapore
      zoom: 15, // Zoom level to display all markers well
    };
  
    const map = new google.maps.Map(mapContainer.value, mapOptions); // Use the ref instead of document.getElementById
  
    // Loop through marker locations and place them on the map
    markerLocations.forEach((location) => {
      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: location.title,
      });
  
      // Create the info window for this marker
      const infoWindow = new google.maps.InfoWindow({
        content: `<p style='color: black;'>${location.title}</p>`,
      });
  
      marker.addListener('click', () => {
        // Close the previously opened info window
        firstClick.value = true;
        if (currentInfoWindow) {
          currentInfoWindow.close();
        }
  
        // Open the new info window and set it as the current one
        infoWindow.open(map, marker);
        currentInfoWindow = infoWindow;
  
        // Set the chosen place
        placeChosen.value = marker.title; // Update placeChosen
      });
    });
  };
  
  onMounted(async () => {
    try {
      await loadGoogleMaps(); // Load Google Maps dynamically
      initMap(); // Initialize the map after Google Maps API is loaded
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  });
  </script>
  
  <style scoped>
  .map-container {
    height: 100%; /* Make the map container fill its parent */
    width: 100%;
    border-radius: 15px;
    border: 1px solid grey; /* Optional: border for visibility */
  }
  
  /* Ensure the parent row has a defined height */
  .row {
    height: 100vh; /* Adjust as needed to fill the viewport */
  }
  </style>  