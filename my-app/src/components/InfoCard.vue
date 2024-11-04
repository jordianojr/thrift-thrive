<template>
  <div class="info-card">
    <h2>{{ placeChosen }}</h2>
    <ul class="events-list">
      <li v-for="(event, index) in filteredEvents" :key="index" class="event-item">
        <h4 style="color: hsla(160, 100%, 37%, 1);">{{ event.name }}</h4>
        <p><strong>Date:</strong> {{ event.date }}</p>
        <p><strong>Time:</strong> {{ event.time }}</p>
        <p>{{ event.description }}</p>
      </li>
    </ul>

    <button @click="openGoogleMapsDirections" class="btn btn-primary">
      Get Directions
    </button>
    
    <div v-if="userRole === 'admin'" class="add-event">
      <h5 class="modal-title">Know of an event here?</h5>
      <h6>Let us know!</h6><br>
        <form @submit.prevent="handleAddEvent">
          <div class="form-group">
            <label for="eventName">Event Name</label>
            <input v-model="newEvent.name" type="text" class="form-control" id="eventName" required />
          </div>
          <div class="form-group">
            <label for="eventDate">Date</label>
            <input v-model="newEvent.date" type="date" class="form-control" id="eventDate" required />
          </div>
          <div class="form-group row">
            <div class="col">
              <label for="eventTime">Start Time</label>
              <input v-model="newEvent.startTime" type="time" class="form-control" id="eventStartTime" required />
            </div>
            <div class="col">
              <label for="eventTime">End Time</label>
              <input v-model="newEvent.endTime" type="time" class="form-control" id="eventEndTime" required />
            </div>
          </div>
          <div class="form-group">
            <label for="eventDescription">Description</label>
            <textarea v-model="newEvent.description" class="form-control" id="eventDescription" required></textarea>
          </div>
          <button type="submit" class="btn btn-success">Add Event</button>
        </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps, computed, ref } from 'vue';
import { db, auth } from '../lib/firebaseConfig'; // Adjust the path as necessary
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'; // Import necessary Firestore functions
import { onMounted } from 'vue';

const userRole = ref('');
const getUserRole = async () => {
  try {
    const userId = auth.currentUser?.uid; // Get the current user's ID

    if (!userId) {
      throw new Error("User is not authenticated.");
    }

    // Reference to the user document in the 'users' collection
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('User role:', userData.role);
      userRole.value = userData.role; // Return the 'role' field
    } else {
      throw new Error("No user found in the database.");
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null; // Or handle the error as needed
  }
};

const props = defineProps<{
  placeChosen: string;
  latitude: number;
  longitude: number;
  locationId: string;
  events: { name: string; date: string; time: string; description: string }[];
}>();

const newEvent = ref({
  name: '',
  date: '',
  startTime: '',  // Keep startTime as a string for input
  endTime: '',    // Keep endTime as a string for input
  description: ''
});

const filteredEvents = computed(() => {
  const currentDate = new Date();
  return props.events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate > currentDate;
  });
});

const openGoogleMapsDirections = () => {
  const coordinates = `${props.latitude},${props.longitude}`;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${coordinates}`;
  window.open(url, '_blank');
};

const handleAddEvent = async () => {
  try {
    // Convert the time format to the desired string format
    const formattedTime = formatTime(newEvent.value.startTime, newEvent.value.endTime);

    // Create a reference to the specific document in the Stores collection
    const storeDocRef = doc(db, 'Stores', props.locationId);

    // Use arrayUnion to add the new event to the events array
    await updateDoc(storeDocRef, {
      events: arrayUnion({
        name: newEvent.value.name,
        date: newEvent.value.date,
        time: formattedTime, // Store the formatted time string
        description: newEvent.value.description,
      })
    });

    // Reset the newEvent object after adding the event
    newEvent.value = {
      name: '',
      date: '',
      startTime: '',
      endTime: '',
      description: ''
    };

    console.log('Event added successfully to store:', props.locationId);
    location.reload();
     // Optional: Refresh the events list after adding a new event
  } catch (error) {
    console.error('Error adding event:', error);
  }
};

// Function to format time from input to desired string format
const formatTime = (startTime: string, endTime: string) => {
  const formatHours = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hourNum = parseInt(hours, 10);
    const suffix = hourNum >= 12 ? 'pm' : 'am';
    const formattedHour = hourNum % 12 || 12; // convert to 12-hour format
    return `${formattedHour}.${minutes}${suffix}`;
  };

  return `${formatHours(startTime)} - ${formatHours(endTime)}`;
};

onMounted(() => {
  getUserRole();
});
</script>

<style scoped>
p {
  color: black !important;
}
.info-card {
  padding: 20px;
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

.add-event {
  margin-top: 30px;
}

.btn-success {
  margin-top: 20px;
}

@media screen and (max-width: 991px) {
  .info-card {
    width: 100%;
    margin: auto;
  }
}
</style>
