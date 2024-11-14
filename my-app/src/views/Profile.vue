<template>
  <div>

    <!-- for alerts popping in and out-->
    <CustomAlert :visible="showAlert" :message="alertMessage" :alert-type="alertType" :timeout="3000"
      @update:visible="showAlert = $event" />

    <!-- Desktop Layout -->
    <div class="desktop-layout">
      <div class="profile-layout">
        <!-- Sidebar Section -->
        <section class="sidebar-section">
          <div class="profile-sidebar">
            <!-- Navigation Links -->
            <div class="nav-links">
              <button class="sidebar-button" :class="{ 'active': activeSection === 'profile' }"
                @click="activeSection = 'profile'">
                Edit Profile
              </button>
              <button class="sidebar-button" :class="{ 'active': activeSection === 'delete' }"
                @click="activeSection = 'delete'">
                Delete Account
              </button>
              <button class="sidebar-button" :class="{ 'active': activeSection === 'reviews' }"
                @click="activeSection = 'reviews'">
                View Reviews
              </button>
              <button class="sidebar-button" :class="{ 'active': activeSection === 'listing' }"
                @click="activeSection = 'listing'">
                Listings
              </button>
              <button class="sidebar-button" :class="{ 'active': activeSection === 'orders' }"
                @click="activeSection = 'orders'">
                Order History
              </button>
              <button class="sidebar-button" :class="{ 'active': activeSection === 'sales' }"
                @click="activeSection = 'sales'">
                Sales History
              </button>
              <button class="sidebar-button" :class="{ 'active': activeSection === 'editposts' }"
                @click="activeSection = 'editposts'">
                Edit Posts
              </button>
              <button class="sidebar-button" :class="{ 'active': activeSection === 'vouchers' }"
                @click="activeSection = 'vouchers'">
                Vouchers
              </button>
              <button class="sidebar-button" style="color: gold;"
                :class="{ 'active': activeSection === 'spin', bouncing: isBouncing }" @click="goToSpin"
                v-if="spinChance > 0">
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
              <input type="password" id="confirmPassword" v-model="confirmPassword" placeholder="Enter your password"
                required />
            </div>
            <button type="button" class="delete-btn" @click="confirmDeleteAccount">Delete Account</button>
          </div>

        <div v-if="activeSection === 'reviews'" class="content-section">
  <div v-if="reviews.length === 0" class="no-container">
    <p>No reviews yet.</p>
  </div>
  <div v-else>
    <!-- Iterate through the reviews array and display each review in its own container -->
    <div v-for="(review, index) in reviews" :key="index" class="review-card">
      <div class="review-body">
        <p>{{ review }}</p>
      </div>
    </div>
  </div>
</div>

<div v-if="activeSection === 'vouchers'" class="content-section">
        <div v-if="vouchers.length === 0" class="no-container">
          <p>No vouchers yet. Spins left: {{ spinChance }}</p>
        </div>
        <div v-else>
          <div v-for="voucher in vouchers" :key="voucher.id" :value="[voucher.prize, voucher.id]" 
          :style="getVoucherBackgroundColor(voucher.prize)"
            class="voucher-card">
            <p>{{ voucher.id}} {{ voucher.prize }}</p>
          </div>
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
        </section>
      </div>
    </div>



    <!-- Mobile Layout -->
    <div class="mobile-layout">
      <!-- Profile Header -->


      <!-- Navigation Scroll Container -->
      <div class="mobile-nav-container">
        <div class="scroll-container">
          <button class="mobile-nav-button" :class="{ 'active': activeSection === 'profile' }"
            @click="activeSection = 'profile'">
            Edit Profile
          </button>
          <button class="mobile-nav-button" :class="{ 'active': activeSection === 'delete' }"
            @click="activeSection = 'delete'">
            Delete Account
          </button>
          <button class="mobile-nav-button" :class="{ 'active': activeSection === 'reviews' }"
            @click="activeSection = 'reviews'">
            Reviews
          </button>
          <button class="mobile-nav-button" :class="{ 'active': activeSection === 'listing' }"
            @click="activeSection = 'listing'">
            Listings
          </button>
          <button class="mobile-nav-button" :class="{ 'active': activeSection === 'orders' }"
            @click="activeSection = 'orders'">
            Orders
          </button>
          <button class="mobile-nav-button" :class="{ 'active': activeSection === 'sales' }"
            @click="activeSection = 'sales'">
            Sales
          </button>
          <button class="mobile-nav-button" :class="{ 'active': activeSection === 'editposts' }"
            @click="activeSection = 'editposts'">
            Posts
          </button>
          <button class="mobile-nav-button" :class="{ 'active': activeSection === 'vouchers' }"
            @click="activeSection = 'vouchers'">
            Vouchers
          </button>
          <button v-if="spinChance > 0" class="mobile-nav-button" style="color: gold;"
            :class="{ 'active': activeSection === 'spin', bouncing: isBouncing }" @click="goToSpin">
            Lucky Wheel
          </button>
        </div>
      </div>

      <!-- Mobile Content Section -->
      <div class="mobile-content">
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
            <input type="password" id="confirmPassword" v-model="confirmPassword" placeholder="Enter your password"
              required />
          </div>
          <button type="button" class="delete-btn" @click="confirmDeleteAccount">Delete Account</button>
        </div>

        <div v-if="activeSection === 'reviews'" class="content-section">
          
  <div v-if="reviews.length === 0" class="no-container">
    <p>No reviews yet.</p>
  </div>
  <div v-else>
    <!-- Iterate through the reviews array and display each review in its own container -->
    <div v-for="(review, index) in reviews" :key="index" class="review-card">
      <div class="review-body">
        <p>{{ review }}</p>
      </div>
    </div>
  </div>
</div>

        <div v-if="activeSection === 'vouchers'" class="content-section">
        <div v-if="vouchers.length === 0" class="no-container">
          <p>No vouchers yet. Spins left: {{ spinChance }}</p>
        </div>
        <div v-else>
          <div v-for="voucher in vouchers" :key="voucher.id" :value="[voucher.prize, voucher.id]" 
          :style="getVoucherBackgroundColor(voucher.prize)"
            class="voucher-card">
            <p>{{ voucher.id}} {{ voucher.prize }}</p>
          </div>
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
          <h5 style="position: fixed; margin-left: 30px; margin-top: 20px;">Spins left: {{ spinChance }}</h5>
          <Game></Game>
        </div>

      </div>
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
import CustomAlert from '@/components/CustomAlert.vue';

interface UserData {
  email?: string;
  username?: string;
  photoURL?: string;
  rating?: number;
  reviews?: string[];
}

const router = useRouter();
const userId = ref('');
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
const activeSection = ref('profile');
const rating = ref(0);
const reviews = ref<string[]>([]);
const spinChance = ref(0);
const vouchers: Ref<Voucher[]> = ref([]);

const isBouncing = ref(false);

const goToSpin = () => {
  router.push('/spin');
};

// Added these refs for alert handling
const showAlert = ref(false);
const alertMessage = ref('');
const alertType = ref('info');  // Can be 'info', 'success', 'warning', or 'error'

// Helper function to show alerts
const showCustomAlert = (message: string, type: 'info' | 'success' | 'warning' | 'error') => {
  alertMessage.value = message;
  alertType.value = type;
  showAlert.value = true;
};
// Auth state observer
const unsubscribe = auth.onAuthStateChanged(async (user) => {
  if (user) {
    await loadFromLocalStorage();
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

const loadFromLocalStorage = async () => {
  const cachedData = localStorage.getItem(`user`);
  if (cachedData) {
    const userData = JSON.parse(cachedData);
    userId.value = userData.uid;
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

    localStorage.setItem(`user`, JSON.stringify({
      uid: uid,
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

      //alert('Profile updated successfully! skibidlicous');
      showCustomAlert('Profile updated successfully!', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      //alert('Error updating profile: ' + errorMessage);
      showCustomAlert(errorMessage, 'error');
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
        //alert('Account deleted successfully. We are sad to see you go!');
        showCustomAlert('Account deleted successfully. We are sad to see you go!', 'success');
        router.push('/login');
        location.reload();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      const realErrorMessage = 'Error deleting account: ' + errorMessage;
      //alert('Error deleting account: ' + errorMessage);
      showCustomAlert('realErrorMessage', 'error');
    }
  }
};

const getUserUID = () => {
    const cachedData = localStorage.getItem(`user`);
    if (cachedData) {
    const userData = JSON.parse(cachedData);
    return userData.uid;
    } else {
    return auth.currentUser?.uid;
    }
};

const fetchVouchers = async () => {
  try {
    const userId = getUserUID()
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    const userVouchers = userDocSnap.data()?.vouchers || [];

    const fetchedVouchers: Voucher[] = []; // Ensure this array matches the Voucher type

    for (const voucherId of userVouchers) {
      const voucherDocRef = doc(db, 'prizes', voucherId);
      const voucherDocSnap = await getDoc(voucherDocRef);

      if (voucherDocSnap.exists()) {
        fetchedVouchers.push({ id: voucherId, ...voucherDocSnap.data() } as Voucher);
      }
    }

    vouchers.value = fetchedVouchers; // This should work now without errors

    console.log(vouchers.value); // Verify the populated data
  } catch (error) {
    console.error("Error fetching vouchers:", error);
  }
};

const getVoucherClass = (prize) => {
  const discount = parseInt(prize.match(/\d+/)[0], 10); // Extract the discount percentage from the string

  if (discount === 5) {
    return 'bronze'; // Bronze class for 5%
  } else if (discount === 10) {
    return 'silver'; // Silver class for 10%
  } else if (discount === 20) {
    return 'gold'; // Gold class for 20%
  }
  return ''; // Default class if no match
};

const getVoucherBackgroundColor = (prize) => {
  const discount = parseInt(prize.match(/\d+/)[0], 10);  // Extract the discount percentage from the string
  console.log(discount); // Debug log to ensure correct extraction
  if (discount === 5) {
    return { backgroundColor: '#cd7f32' }; // Bronze color
  } else if (discount === 10) {
    return { backgroundColor: '#c0c0c0' }; // Silver color
  } else if (discount === 20) {
    return { backgroundColor: '#ffd700' }; // Gold color
  }
  return { backgroundColor: '#f0f0f0' }; // Default color for any other prize
};

watch(activeSection, () => {
  tempName.value = name.value;
  if (tempPhotoURL.value) {
    URL.revokeObjectURL(tempPhotoURL.value);
    tempPhotoURL.value = '';
  }
  tempFile.value = null;
});

const tl = gsap.timeline({ defaults: { duration: 0.5 } });
onMounted(async () => {
  await fetchVouchers();

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

.voucher-card {
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease; /* Smooth transition for hover effects */
  border: 1px solid transparent; /* Initially, no border */
}


.voucher-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border-color: #4CAF50; /* Green glowing border on hover */
  border-width: 2px; /* Border width on hover */
  animation: glow 0.5s ease-in-out infinite alternate; /* Animation for glowing effect */
}

.review-card {
  background-color: #ffffffb5;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.review-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

@keyframes bounce {

  0%,
  20%,
  50%,
  80%,
  100% {
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

h2 {
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
  min-height: 300px;
  /* Adjust this value based on your needs */
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


.nav-links {
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

.content-section {
  padding-left: 130px;
  padding-right: 130px;
  padding-top: 40px;
}

@media (max-width: 1200px) {
  .content-section {
    padding-left: 60px;
    padding-right: 60px;
  }
}

@media (max-width: 992px) {
  .content-section {
    padding-left: 30px;
    padding-right: 30px;
  }
}

@media (max-width: 768px) {
  .content-section {
    padding-left: 10px;
    padding-right: 10px;
  }
}

@media (max-width: 480px) {
  .content-section {
    padding-left: 10px;
    padding-right: 10px;
  }
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
  justify-content: center;
  /* Horizontally center the image */
  align-items: center;
  /* Vertically center the image (if necessary) */
  margin-top: 15px;
  margin-bottom: 15px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
  margin-left: auto;
  /* Center the container horizontally */
  margin-right: auto;
  /* Center the container horizontally */
}

.profile-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.col-9 {
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


.review-btn,
.save-btn,
.delete-btn {
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
  padding-bottom: 7px;
}

.review-btn:hover,
.save-btn:hover {
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
    flex: 0 0 100%;
    /* Make it full width */
    max-width: 100%;
    /* Prevent it from exceeding full width */
  }
}

/* Updated and New Mobile Styles */
@media (max-width: 480px) {
  .desktop-layout {
    display: none;
  }

  .mobile-layout {
    display: block;
  }

  .mobile-profile-header {
    padding: 1rem;
    background: white;
    border-bottom: 1px solid #e2e8f0;
  }

  .profile-photo.mobile {
    width: 100px;
    height: 100px;
    margin: 0 auto;
  }

  .user-info {
    margin-top: 1rem;
  }

  .mobile-nav-container {
    position: sticky;
    top: 74px;
    background: white;
    z-index: 10;
    border-bottom: 1px solid #e2e8f0;
  }

  .scroll-container {
    display: flex;
    overflow-x: auto;
    padding: 0.5rem;
    gap: 0.5rem;
    scrollbar-width: none;
    -ms-overflow-style: none;
    white-space: nowrap;
  }

  .scroll-container::-webkit-scrollbar {
    display: none;
  }

  .mobile-nav-button {
    display: inline-block;
    padding: 0.3rem 0.6rem;
    margin-right: 0.2rem;
    background: none;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    font-family: 'Helvetica Neue', sans-serif;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .mobile-nav-button.active {
    color: green;
    border-color: green;
    text-decoration: underline;
  }

  .mobile-nav-button:hover {
    color: green;
    border-color: green;
    scale: 1.03;
  }

}
</style>