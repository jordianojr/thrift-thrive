<template>
  <div class="info-card">
    <h3>{{ placeChosen }}</h3>
    <ul class="events-list">
      <li v-for="(event, index) in filteredEvents" :key="index" class="event-item">
        <h4>{{ event.name }}</h4>
        <p><strong>Date:</strong> {{ event.date }}</p>
        <p><strong>Time:</strong> {{ event.time }}</p>
        <p>{{ event.description }}</p>
      </li>
    </ul>
    <button @click="openGoogleMapsDirections" class="directions-btn">
      Get Directions
    </button>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, computed } from 'vue';

const props = defineProps<{
  placeChosen: string;
  latitude: number;
  longitude: number;
  events: { name: string; date: string; time: string; description: string }[];
}>();

// Compute filtered events based on the current date
const filteredEvents = computed(() => {
  const currentDate = new Date(); // Get the current date
  return props.events.filter(event => {
    const eventDate = new Date(event.date); // Convert event date to Date object
    return eventDate > currentDate; // Return only future events
  });
});

const openGoogleMapsDirections = () => {
  const coordinates = `${props.latitude},${props.longitude}`;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates}`;
  window.open(url, '_blank');
};
</script>

<style scoped>
p {
  color: black !important;
}
.info-card {
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.events-list {
  list-style-type: none;
  padding: 0;
  margin-top: 10px;
}

.event-item {
  margin-bottom: 15px;
}

.directions-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.directions-btn:hover {
  background-color: #3367d6;
}

@media screen and (max-width: 992px) {
  .info-card {
    width: 50%;
    margin: auto;
  }
}
</style>
