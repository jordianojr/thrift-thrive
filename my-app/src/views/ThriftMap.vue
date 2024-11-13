<template>
  <div style="padding-top: 45px; padding-bottom: 45px; border-bottom: black solid 1px;">
      <h3 class="head">Thrift Stores in Singapore</h3>
  </div>
  <div class="row g-0">
    <div class="col-12 col-lg-8 col-xl-8 col-xxl-8">
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
        elementType: "geometry",
        stylers: [{ color: "#f5f5f5" }]
      },
      {
        elementType: "labels.text.fill",
        stylers: [{ color: "#616161" }]
      },
      {
        elementType: "labels.text.stroke",
        stylers: [{ color: "#f5f5f5" }]
      },
      {
        featureType: "administrative.land_parcel",
        elementType: "labels.text.fill",
        stylers: [{ color: "#bdbdbd" }]
      },
      {
        featureType: "poi",
        elementType: "geometry",
        stylers: [{ color: "#eeeeee" }]
      },
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#ffffff" }]
      },
      {
        featureType: "road.arterial",
        elementType: "labels.text.fill",
        stylers: [{ color: "#757575" }]
      },
      {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#dadada" }]
      },
      {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#616161" }]
      },
      {
        featureType: "road.local",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9e9e9e" }]
      },
      {
        featureType: "transit.line",
        elementType: "geometry",
        stylers: [{ color: "#e5e5e5" }]
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#e9e9e9" }]
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9e9e9e" }]
      }
    ]
  };

  const map = new google.maps.Map(mapContainer.value, mapOptions);
  let activeMarker: google.maps.Marker | null = null;

  // Place markers on the map using locations from Firestore
  markerLocations.value.forEach((location) => {
    const marker = new google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: map,
      title: location.title,
      icon: {
      path: "M7.5 0C5.068 0 2.23 1.486 2.23 5.27c0 2.568 4.054 7.95 5.27 9.408c.162.196.413.322.697.322c.283 0 .534-.126.696-.322c1.216-1.458 5.27-6.84 5.27-9.408C14.163 1.487 11.327 0 8.893 0H7.5z",
      scale: 1.5,
      fillColor: '#000000',
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: '#000000',
      }
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `<p style='color: black; font-weight: 500;'>${location.title}</p>`,
    });

    marker.addListener("click", () => {
      firstClick.value = true;

      if (activeMarker) {
        activeMarker.setIcon({
          path: "M7.5 0C5.068 0 2.23 1.486 2.23 5.27c0 2.568 4.054 7.95 5.27 9.408c.162.196.413.322.697.322c.283 0 .534-.126.696-.322c1.216-1.458 5.27-6.84 5.27-9.408C14.163 1.487 11.327 0 8.893 0H7.5z",
          scale: 1.5,
          fillColor: '#000000',
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: '#000000',
        });
      }
      marker.setIcon({
        path: "M7.5 0C5.068 0 2.23 1.486 2.23 5.27c0 2.568 4.054 7.95 5.27 9.408c.162.196.413.322.697.322c.283 0 .534-.126.696-.322c1.216-1.458 5.27-6.84 5.27-9.408C14.163 1.487 11.327 0 8.893 0H7.5z",
        scale: 1.5,
        fillColor: '#FF0000',
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#FF0000',
      });
      activeMarker = marker;

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
}

.row {
  height: 100vh;
  margin: 0;
}

.head {
    font-family: 'Helvetica Neue', sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    text-align: center;
    font-size: 1.9rem;
    color: black;
    margin: 0;
  }

@media screen and (max-width: 991px) {
  .map-container {
    width: 100%;
    height: 400px;
    margin: 0;
  }
}

</style>
