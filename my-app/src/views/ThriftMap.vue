<template>
  <div style="margin-bottom: 43px">
      <h3 class="title">Thrift & Vintage Stores in Singapore</h3>
  </div>
  <div class="row">
    <div class="col-12 col-lg-8 col-xl-8 col-xxl-8" style="margin-bottom: 20px;">
      <div ref="mapContainer" class="map-container"></div>
    </div>
    <div class="col-12 col-lg-4 col-xl-4 col-xxl-4" v-if="firstClick">
      <InfoCard 
        :placeChosen="placeChosen" 
        :latitude="lat" 
        :longitude="lng" 
        :locationId="locationId"
        :events="events" 
        />
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
const locationId = ref('');
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
    zoom: 13,
    styles: [
        {
          // Apply your custom styles here
          featureType: 'all',
          elementType: 'all',
          stylers: [
            { saturation: -20 },
            { lightness: 20 },
            { visibility: 'simplified' },
          ],
        },
        {
        featureType: "road",
        elementType: "geometry",
        stylers: [
          { color: "#595959" },
          { lightness: 80 }
        ],
      },
      {
        featureType: "road.arterial",
        elementType: "labels.text.fill",
        stylers: [{ color: "#757575" }],
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#dadada" }],
      },
      {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#616161" }],
      },
      {
        featureType: "road.local",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9e9e9e" }],
      },
        {
          featureType: 'all',
          elementType: 'labels.text.fill',
          stylers: [
            { color: '#464646' } // Set label text color to white
          ]
        },
        {
          featureType: 'poi',
          elementType: 'all',
          stylers: [
            { visibility: 'off' } // Hide all points of interest
          ]
        },
      ],
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
      content: `<p style='color: black; font-weight: 500;'>${location.title}</p>`,
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
      locationId.value = location.id;
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

.title {
    font-family: 'Helvetica Neue', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    text-align: center;
    font-size: 1.9rem;
    color: black;
    margin-bottom: 1.1rem;
  }

@media screen and (max-width: 991px) {
  .map-container {
    width: 100%;
    height: 400px;
    margin: auto;
  }
}

.title {
    font-family: 'Helvetica Neue', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    text-align: center;
    font-size: 1.9rem;
    color: black;
    margin-bottom: 1.1rem;
  }
</style>
