<template>
  <div class="row">
    <div class="col-12 col-lg-9 col-xl-9 col-xxl-9" style="margin-bottom: 20px;">
      <div ref="mapContainer" class="map-container"></div>
    </div>
    <div class="col-12 col-lg-3 col-xl-3 col-xxl-3" v-if="firstClick">
      <InfoCard :placeChosen="placeChosen" :latitude="lat" :longitude="lng" :events="events" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import loadGoogleMaps from '@/lib/googleMaps';
import InfoCard from '@/components/InfoCard.vue';
import { db } from '@/lib/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const placeChosen = ref('');
const lat = ref(0);
const lng = ref(0);
const firstClick = ref(false);
const events = ref([]);

// Marker locations array to be populated with data from Firestore
const markerLocations = ref([]);

const mapContainer = ref<HTMLElement | null>(null);
let currentInfoWindow: google.maps.InfoWindow | null = null;

// Fetch data from Firestore and set it as marker locations
const fetchMarkerLocations = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "Stores"));
    const locations = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    markerLocations.value = locations;
  } catch (error) {
    console.error("Error fetching marker locations:", error);
  }
};

const initMap = () => {
  if (!mapContainer.value) return;

  const mapOptions: google.maps.MapOptions = {
    center: { lat: 1.2956, lng: 103.8542 },
    zoom: 15,
  };

  const map = new google.maps.Map(mapContainer.value, mapOptions);

  // Place markers on the map using locations from Firestore
  markerLocations.value.forEach((location) => {
    const marker = new google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: map,
      title: location.title,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<p style='color: black;'>${location.title}</p>`,
    });

    marker.addListener("click", () => {
      firstClick.value = true;
      if (currentInfoWindow) {
        currentInfoWindow.close();
      }

      infoWindow.open(map, marker);
      currentInfoWindow = infoWindow;

      // Set the chosen place details
      placeChosen.value = location.title;
      lat.value = location.lat;
      lng.value = location.lng;
      events.value = location.events || [];
    });
  });
};

onMounted(async () => {
  try {
    await loadGoogleMaps();
    await fetchMarkerLocations(); // Fetch data from Firestore
    initMap(); // Initialize the map after data is fetched and Google Maps is loaded
  } catch (error) {
    console.error("Error initializing map:", error);
  }
});
</script>

<style scoped>
.map-container {
  height: 100%;
  width: 100%;
  border-radius: 15px;
}

.row {
  height: 100vh;
}
</style>
