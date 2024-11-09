<template>
  <div class="desktop-layout">
    <div class="profile-layout">
      <!-- Sidebar Section -->
      <!-- Sidebar Section -->
      <section class="sidebar-section">
        <div class="profile-sidebar">
          <!-- Navigation Links -->
          <div class="nav-links">
            <button 
              class="sidebar-button"
              :class="{ 'active': activeSection === 'profile' }"
              @click="activeSection = 'profile'"
            >
              Edit Profile
            </button>
            <button 
              class="sidebar-button"
              :class="{ 'active': activeSection === 'delete' }"
              @click="activeSection = 'delete'"
            >
              Delete Account
            </button>
            <button 
              class="sidebar-button"
              :class="{ 'active': activeSection === 'reviews' }"
              @click="activeSection = 'reviews'"
            >
              View Reviews
            </button>
            <button 
              class="sidebar-button"
              :class="{ 'active': activeSection === 'listing' }"
              @click="activeSection = 'listing'"
            >
              Listings
            </button>
            <button 
              class="sidebar-button"
              :class="{ 'active': activeSection === 'orders' }"
              @click="activeSection = 'orders'"
            >
              Order History
            </button>
            <button 
              class="sidebar-button"
              :class="{ 'active': activeSection === 'sales' }"
              @click="activeSection = 'sales'"
            >
              Sales History
            </button>
            <button 
              class="sidebar-button"
              :class="{ 'active': activeSection === 'editposts' }"
              @click="activeSection = 'editposts'"
            >
              Edit Posts
            </button>
            <button 
              class="sidebar-button"
              :class="{ 'active': activeSection === 'vouchers' }"
              @click="activeSection = 'vouchers'"
            >
              Vouchers
            </button>
            <button 
              class="sidebar-button"
              style="color: gold;"
              :class="{ 'active': activeSection === 'spin', bouncing: isBouncing }"
              @click="activeSection = 'spin'"
              v-if="spinChance > 0"
            >
              Lucky Wheel
            </button>
          </div>
        </div>
      </section>

      <!-- Display Section -->
      <section class="display-section">
        <div class="section-header">
          <h2>{{ activeSection === 'profile' ? 'Edit Profile' : 
               activeSection === 'delete' ? 'Delete Account' : 
               activeSection === 'reviews' ? 'User Reviews' :
               activeSection === 'listing' ? 'Listings' :
               activeSection === 'editposts' ? 'Edit Posts' :
               activeSection === 'spin' ? 'Lucky Wheel' :
               activeSection === 'vouchers' ? 'Vouchers' :
               activeSection === 'orders' ? 'Order History' : 'Sales History' }}</h2>
        </div>

        <!-- Dynamic Content Based on Selection -->
        <div v-if="activeSection === 'profile'" class="content-section">
          <!-- User Profile Info -->
          <div class="profile-header">
            <div class="profile-photo">
              <img :src="tempPhotoURL || photoURL || '../assets/user.jpeg'" alt="Profile Photo" />
            </div>
            
            <div class="user-info text-center mb-4">
              <p class="mb-1"><strong>{{ tempName || name }}</strong></p>
              <p class="mb-1">{{ userEmail }}</p>
              <p class="mb-1">
                <strong>Rating: </strong> {{ rating }}
                <span v-for="n in 5" :key="n">
                  <i :class="{
                    'bi-star-fill': n <= rating,
                    'bi-star': n > rating
                  }" style="color: black; font-size: 1.2rem;">
                  </i>
                </span>
              </p>
            </div>
          </div>
          <form @submit.prevent="updateProfile" class="content-section">
            <div class="form-group">
              <label for="name">Name:</label>
              <input type="text" id="name" v-model="tempName" placeholder="Enter your name" required />
            </div>
            <div class="form-group">
              <label for="photo">Profile Photo:</label>
              <input type="file" id="photo" @change="handlePhotoUpload" accept="image/*" />
            </div>
            <button type="submit" class="save-btn">Save Changes</button>
          </form>
        </div>

        <div v-if="activeSection === 'delete'" class="content-section">
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
          <div class="form-group">
            <label for="confirmEmail">Email:</label>
            <input type="email" id="confirmEmail" v-model="confirmEmail" placeholder="Enter your email" required />
          </div>
          <div class="form-group">
            <label for="confirmPassword">Password:</label>
            <input type="password" id="confirmPassword" v-model="confirmPassword" placeholder="Enter your password" required />
          </div>
          <button type="button" class="delete-btn" @click="confirmDeleteAccount">Delete Account</button>
        </div>

        <div v-if="activeSection === 'reviews'" class="content-section">
          <div v-if="reviews.length === 0" class="no-container">
            <p>No reviews yet.</p>
          </div>
          <div v-else>
            <ol>
              <li v-for="review in reviews">{{ review }}</li>
            </ol>
          </div>
        </div>

        <div v-if="activeSection === 'vouchers'" class="content-section">
          <div v-if="vouchers.length === 0" class="no-container">
            <p>No vouchers yet.</p>
            <p>Spins left: {{ spinChance }}</p>
          </div>
          <div v-else>
            <ol>
              <li v-for="voucher in vouchers">{{ voucher }}</li>
            </ol>
            <p>Spins left: {{ spinChance }}</p>
          </div>
        </div>

        <div v-if="activeSection === 'listing'">
          <Listing></Listing>
        </div>
        <div v-if="activeSection === 'orders'">
          <OrderHistory />
        </div>
        <div v-if="activeSection === 'sales'">
          <SalesHistory />
        </div>
        <div v-if="activeSection === 'editposts'">
          <EditPosts />
        </div>
        <div v-if="activeSection === 'spin'">
          <h5 style="margin-left: 30px; margin-top: 20px;">Spins left: {{ spinChance }}</h5>
          <Game />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { auth, db, storage } from '../lib/firebaseConfig'; 
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'vue-router';
import Listing from '../components/Listing.vue';
import OrderHistory from '../components/OrderHistory.vue';
import SalesHistory from '../components/SalesHistory.vue';
import EditPosts from './EditPosts.vue';
import Game from '@/components/Game.vue';

interface UserData {
  email?: string;
  username?: string;
  photoURL?: string;
  rating?: number;
  reviews?: string[];
}

const router = useRouter();
const userEmail = ref('');
const name = ref('');
const photoURL = ref('');
const tempName = ref('');
const tempPhotoURL = ref('');
const tempFile = ref<File | null>(null);
const profileRef = ref<HTMLElement | null>(null);
const customColRef = ref<HTMLElement | null>(null);
const confirmEmail = ref('');
const confirmPassword = ref('');
const activeSection = ref('listing');
const rating = ref(0);
const reviews = ref<string[]>([]);
const spinChance = ref(0);
const vouchers = ref<string[]>([]);

const isBouncing = ref(false);

// Auth state observer
const unsubscribe = auth.onAuthStateChanged(async (user) => {
  if (user) {
    await loadFromLocalStorage(user.uid);
    await fetchUserData(user.uid);
  } else {
    resetUserData();
  }
});

const startBouncing = () => {
  isBouncing.value = true;
  setTimeout(() => {
    isBouncing.value = false;
  }, 1000); // Duration of the animation
};

const loadFromLocalStorage = async (uid: string) => {
  const cachedData = localStorage.getItem(`user_${uid}`);
  if (cachedData) {
    const userData = JSON.parse(cachedData);
    userEmail.value = userData.email || '';
    name.value = userData.name || '';
    photoURL.value = userData.photoURL || '';
    tempName.value = userData.name || '';
  }
};

const fetchUserData = async (uid: string) => {
  const userDoc = doc(db, 'users', uid);
  const userSnapshot = await getDoc(userDoc);

  if (userSnapshot.exists()) {
    const userData = userSnapshot.data() as UserData;
    userEmail.value = userData.email || '';
    name.value = userData.username || '';
    photoURL.value = userData.photoURL || '';
    tempName.value = userData.username || '';
    rating.value = userData.rating || 0;
    reviews.value = userData.reviews || [];
    spinChance.value = userData.spinChance || 0;
    vouchers.value = userData.vouchers || [];

    localStorage.setItem(`user_${uid}`, JSON.stringify({
      email: userEmail.value,
      name: name.value,
      photoURL: photoURL.value,
    }));
  }
};

const resetUserData = () => {
  userEmail.value = '';
  name.value = '';
  photoURL.value = '';
  tempName.value = '';
  tempPhotoURL.value = '';
  tempFile.value = null;
};

const handlePhotoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    tempFile.value = file;
    tempPhotoURL.value = URL.createObjectURL(file);
  }
};

const updateProfile = async () => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      let newPhotoURL = photoURL.value;
      
      if (tempFile.value) {
        const storagePath = `profile_photos/${currentUser.uid}`;
        const photoRef = storageRef(storage, storagePath);
        await uploadBytes(photoRef, tempFile.value);
        newPhotoURL = await getDownloadURL(photoRef);
      }

      const userDoc = doc(db, 'users', currentUser.uid);
      const userData: UserData = {
        username: tempName.value,
        photoURL: newPhotoURL,
      };
      
      await setDoc(userDoc, userData, { merge: true });
      
      name.value = tempName.value;
      photoURL.value = newPhotoURL;
      
      tempFile.value = null;
      if (tempPhotoURL.value) {
        URL.revokeObjectURL(tempPhotoURL.value);
        tempPhotoURL.value = '';
      }
      
      alert('Profile updated successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      alert('Error updating profile: ' + errorMessage);
    }
  }
};

const confirmDeleteAccount = async () => {
  if (confirmEmail.value && confirmPassword.value) {
    try {
      await signInWithEmailAndPassword(auth, confirmEmail.value, confirmPassword.value);
      const currentUser = auth.currentUser;
      if (currentUser) {
        await deleteDoc(doc(db, 'users', currentUser.uid));
        await currentUser.delete();
        localStorage.removeItem(`user_${currentUser.uid}`);
        alert('Account deleted successfully. We are sad to see you go!');
        router.push('/login');
        location.reload();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      alert('Error deleting account: ' + errorMessage);
    }
  }
};

// Remove updateUserProfile as its functionality is now merged into updateProfile

watch(activeSection, () => {
  tempName.value = name.value;
  if (tempPhotoURL.value) {
    URL.revokeObjectURL(tempPhotoURL.value);
    tempPhotoURL.value = '';
  }
  tempFile.value = null;
});

const tl = gsap.timeline({ defaults: { duration: 0.5 } });
onMounted(() => {
  if (profileRef.value) {
    tl.fromTo(profileRef.value, { opacity: 0 }, { opacity: 1 });
  }
  if (customColRef.value) {
    tl.fromTo(customColRef.value, { x: -100, opacity: 0 }, { x: 0, opacity: 1 }, "<");
  }
  setInterval(startBouncing, 3000);
});

onBeforeUnmount(() => {
  unsubscribe();
  // Clean up any object URLs
  if (tempPhotoURL.value) {
    URL.revokeObjectURL(tempPhotoURL.value);
  }
});
</script>


<style scoped>

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-15px);
  }
  60% {
    transform: translateY(-10px);
  }

}
.bouncing {
  animation: bounce 1s ease;
}

h2{
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  text-align: center;
  font-size: 1.9rem;
  color: black;
  margin: 0;
  padding-top: 45px; 
  padding-bottom: 45px; 
  border-bottom: black solid 1px;
}

.no-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px; /* Adjust this value based on your needs */
}

.no-container p {
  margin: 0;
  text-align: center;
}


.sidebar-section {
  position: sticky;
  top: 74px;
  left: 0;
  width: 20%;
  height: 100vh;
  background-color: white;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  border-right: 1px solid black;
}

.sidebar-section::-webkit-scrollbar {
  display: none;
}

.profile-sidebar {
  padding: 1rem;
}

.display-section {
  flex: 1;
  overflow-y: auto;
}


.nav-links{
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-button {
  background: none;
  border: none;
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 500;
  text-transform: uppercase;
  text-align: left;
  padding: 0.2rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
  width: 100%;
}

.selected,
.active,
.sidebar-button.selected {
  color: green;
  border-color: green;
  text-decoration: underline;
}

/* Hover States */
.sidebar-button:hover {
  color: green;
  border-color: green;
  scale: 1.03;
}


/* Mobile Styles */
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

  .profile-layout {
    flex-direction: column;
  }

  .sidebar-section {
    width: 100%;
    height: auto;
    border-bottom: 1px solid #e2e8f0;
  }

  .sticky-nav {
    position: sticky;
    top: 104px;
    z-index: 10;
    background: white;
  }

  .profile-photo.mobile {
    width: 100px;
    height: 100px;
  }

  .scroll-container {
    display: flex;
    overflow-x: auto;
    padding: 0.5rem;
    gap: 0.5rem;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .scroll-container::-webkit-scrollbar {
    display: none;
  }

  .mobile-nav-button {
    flex: 0 0 auto;
    padding: 0.5rem 1rem;
    background: none;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-family: 'Helvetica Neue', sans-serif;
    font-size: 0.8rem;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .mobile-nav-button:hover {
    color: green;
    border-color: green;
  }
}

.profile-container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.content-section{
  padding-left: 130px;
  padding-right: 130px;
  padding-top: 40px;
}

input[type="text"],
input[type="email"],
input[type="password"],
input[type="file"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.profile {
  height: 100%;
}

.profile-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}


.profile-photo {
  display: flex;
  justify-content: center; /* Horizontally center the image */
  align-items: center; /* Vertically center the image (if necessary) */
  margin-top: 15px;
  margin-bottom: 15px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
  margin-left: auto; /* Center the container horizontally */
  margin-right: auto; /* Center the container horizontally */
}

.profile-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.col-9{
  padding-right: 0px;
}
.card {
  margin-bottom: 20px;
  width: 400px;
}

.p h5 {
  font-family: 'Helvetica Neue', sans-serif;
  color: black;
  font-size: 1rem;
  font-weight: 400;
}


.review-btn, .save-btn, .delete-btn {
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 500;
  background-color: black !important;
  letter-spacing: 1px;
  color: white !important;
  transition: all 0.3s ease;
  text-transform: uppercase;
  text-align: center;
  font-size: 0.875rem !important;
  border: black 1px solid !important;
  cursor: pointer;
  width: 100%;
  padding-top: 7px;
  padding-bottom:7px;
}

.review-btn:hover, .save-btn:hover {
  color: black !important;
  background-color: white !important;
  border: black 1px solid !important;
}

.delete-btn {
  background-color: red !important;
  border: red 1px solid !important;
}

.delete-btn:hover {
  color: red !important;
  background-color: white !important;
  border: red 1px solid !important;
}

@media (max-width: 1228px) {
  .custom-col {
    flex: 0 0 100%; /* Make it full width */
    max-width: 100%; /* Prevent it from exceeding full width */
  }
}
</style>