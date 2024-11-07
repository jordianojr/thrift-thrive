<template>
  <div class="row">
    <div ref="profileRef" class="card col-lg-3 col-12 profile mx-auto" style="width: 18rem;">
      <div class="card-body" style="padding-bottom: 10px;">
        <h4 class="card-title">Your Profile</h4>
        <div v-if="photoURL" class="profile-photo">
          <img :src="photoURL" alt="Profile Photo" />
        </div>
        <div v-else class="profile-photo">
          <img src="../assets/user.jpeg" alt="Profile Photo" />
        </div>
        <p class="card-text" style="color: black"><strong>Email:</strong> {{ userEmail }}</p>
        <p class="card-text" style="color: black"><strong>Name:</strong> {{ name }}</p>
        <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <button style="width: 48%; background-color: white; color: black; border: 1px solid black;" type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#editProfileModal">
            <i class="bi bi-pencil-square"></i> Edit Profile
          </button>
          <button style="width: 48%; margin-left: 10px; background-color: black; border: 1px solid black;" type="button" class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteAccountModal">
            <i class="bi bi-trash"></i> Delete Account
          </button>
        </div>
      </div>
    </div>
    <div ref="customColRef" class="col-lg-9 col-12 custom-col mx-auto">
      <Listing></Listing>
    </div>
  </div>
  <div style="margin-top: 20px;">
    <OrderHistory />
  </div>
  
  <!-- Edit Profile Modal -->
  <div class="modal fade" id="editProfileModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="editProfileModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="editProfileModalLabel">
            <i class="bi bi-pencil-square"></i> Edit Profile
          </h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateProfile">
            <div class="form-group">
              <label for="name">Name:</label>
              <input type="text" id="name" v-model="name" placeholder="Enter your name" required />
            </div>
            <div class="form-group">
              <label for="photo">Profile Photo:</label>
              <input type="file" id="photo" @change="handlePhotoUpload" accept="image/*" />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="submit" class="btn btn-success">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Account Modal -->
  <div class="modal fade" id="deleteAccountModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="deleteAccountModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="deleteAccountModalLabel">
            <i class="bi bi-trash"></i> Delete Account
          </h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
          <div class="form-group">
            <p>Please confirm your email and password for account deletion:</p>
            <label for="confirmEmail">Email:</label>
            <input type="email" id="confirmEmail" v-model="confirmEmail" placeholder="Enter your email" required />
          </div>
          <div class="form-group">
            <label for="confirmEmail">Password:</label>
            <input type="password" id="confirmPassword" v-model="confirmPassword" placeholder="Enter your password" required />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-danger" @click="confirmDeleteAccount">Delete Account</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from 'gsap';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { auth, db, storage } from '../lib/firebaseConfig'; 
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'vue-router';
import Listing from '../components/Listing.vue';
import OrderHistory from '../components/OrderHistory.vue';

const router = useRouter();
const userEmail = ref('');
const name = ref('');
const photoURL = ref('');
const profileRef = ref<HTMLElement | null>(null);
const customColRef = ref<HTMLElement | null>(null);
const confirmEmail = ref('');
const confirmPassword = ref('');

// Auth state observer
const unsubscribe = auth.onAuthStateChanged(async (user) => {
  if (user) {
    await loadFromLocalStorage(user.uid);
    await fetchUserData(user.uid);
  } else {
    resetUserData();
  }
});

const loadFromLocalStorage = async (uid: string) => {
  const cachedData = localStorage.getItem(`user_${uid}`);
  if (cachedData) {
    const userData = JSON.parse(cachedData);
    userEmail.value = userData.email || '';
    name.value = userData.name || '';
    photoURL.value = userData.photoURL || '';
  }
};

const fetchUserData = async (uid: string) => {
  const userDoc = doc(db, 'users', uid);
  const userSnapshot = await getDoc(userDoc);

  if (userSnapshot.exists()) {
    const userData = userSnapshot.data();
    userEmail.value = userData.email || '';
    name.value = userData.username || '';
    photoURL.value = userData.photoURL || '';

    // Update local storage
    localStorage.setItem(`user_${uid}`, JSON.stringify({
      email: userEmail.value,
      name: name.value,
      photoURL: photoURL.value,
    }));
  }
};

// Reset user data when signed out
const resetUserData = () => {
  userEmail.value = '';
  name.value = '';
  photoURL.value = '';
};

onBeforeUnmount(() => {
  unsubscribe(); // Clean up the observer
});

const handlePhotoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    const storagePath = `profile_photos/${auth.currentUser?.uid}`; // Use auth.currentUser here
    const photoRef = storageRef(storage, storagePath);

    await uploadBytes(photoRef, file);
    const downloadURL = await getDownloadURL(photoRef);
    photoURL.value = downloadURL; 
    
    await updateUserProfile(downloadURL);
  }
};

const updateUserProfile = async (downloadURL: string) => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const userDoc = doc(db, 'users', currentUser.uid);
    const userData = {
      username: name.value,
      photoURL: downloadURL,
    };
    await setDoc(userDoc, userData, { merge: true });

    localStorage.setItem(`user_${currentUser.uid}`, JSON.stringify({
      email: userEmail.value,
      name: name.value,
      photoURL: downloadURL,
    }));

    alert('Profile updated successfully!');
  }
};

const updateProfile = async () => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const userDoc = doc(db, 'users', currentUser.uid);
    const userData = {
      username: name.value,
    };
    await setDoc(userDoc, userData, { merge: true });
    alert('Profile name updated successfully!');
  }
};

const confirmDeleteAccount = async () => {
  if (confirmEmail && confirmPassword) {
    try {
      await signInWithEmailAndPassword(auth, confirmEmail.value, confirmPassword.value);
      const currentUser = auth.currentUser;
      if (currentUser) {
        await deleteDoc(doc(db, 'users', currentUser.uid)); // Delete user data from Firestore
        await currentUser.delete(); // Delete user account
        localStorage.removeItem(`user_${currentUser.uid}`); // Clear local storage
        alert('Account deleted successfully. We are sad to see you go!');
        router.push('/login'); // Redirect to home page
        location.reload(); // Reload the page
      }
    } catch (error) {
      alert('Error deleting account: ' + error.message);
    }
  }
};

const tl = gsap.timeline({ defaults: { duration: 0.5 } });
onMounted(() => {
  if (profileRef.value) {
    tl.fromTo(profileRef.value, { opacity: 0 }, { opacity: 1 });
  }
  if (customColRef.value) {
    tl.fromTo(customColRef.value, { x: -100, opacity: 0 }, { x: 0, opacity: 1 }, "<");
  }
});
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h4 {
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
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

@media (max-width: 1228px) {
  .custom-col {
    flex: 0 0 100%; /* Make it full width */
    max-width: 100%; /* Prevent it from exceeding full width */
  }
}
</style>