<template>
  <section class="upload-section container-fluid">
    <LoadingOverlay :isLoading="isLoading" message="Uploading your item..." />
    <form @submit.prevent="handleUpload" class="upload-form">
      <div>
        <h3 class="head">Sell Item</h3>
      </div>
        <div class="form-group">
          <label for="item-name">Name:</label>
          <input type="text" id="item-name" v-model="itemName" placeholder="Enter item name" required />
        </div>
        <div class="form-group">
          <label for="item-description">Description:</label>
          <textarea id="item-description" v-model="itemDescription" placeholder="Enter item description" required></textarea>
        </div>
        <div class="form-group">
        <label class="form-label">Upload Photos (Front, Back, Tag):</label>
        <div class="row mb-3">
          <div class="col-4">
            <label class="custom-file-upload">
              <input 
                type="file" 
                @change="(event) => handleSinglePhoto(event, 'front')" 
                accept="image/*" 
                required 
              />
              <img v-if="previewImages.front" :src="previewImages.front" class="img-thumbnail" alt="Front Photo" />
              <span v-else>Front Photo</span>
            </label>
          </div>
          <div class="col-4">
            <label class="custom-file-upload">
              <input 
                type="file" 
                @change="(event) => handleSinglePhoto(event, 'back')" 
                accept="image/*" 
                required 
              />
              <img v-if="previewImages.back" :src="previewImages.back" class="img-thumbnail" alt="Back Photo" />
              <span v-else>Back Photo</span>
            </label>
          </div>
          <div class="col-4">
            <label class="custom-file-upload">
              <input 
                type="file" 
                @change="(event) => handleSinglePhoto(event, 'tag')" 
                accept="image/*" 
                required 
              />
              <img v-if="previewImages.tag" :src="previewImages.tag" class="img-thumbnail" alt="Tag Photo" />
              <span v-else>Tag Photo</span>
            </label>
          </div>
        </div>
        <small class="form-text text-muted">Please upload photos: front, back, and tag.</small>
      </div>
      <!-- Other fields here -->
      <div class="form-group row">
        <div class="col-6">
          <label for="item-price">Price:</label>
          <input type="number" id="item-price" v-model="itemPrice" placeholder="Enter item price" required />
        </div>
        <div class="col-6">
          <label for="category">Category:</label>
          <select v-model="chosenCat" id="category" required>
            <option disabled value="">Select a category</option>
            <option v-for="cat in categories" :key="cat">{{ cat }}</option>
          </select>
        </div>
      </div>
      <!-- Additional Fields -->
      <div class="form-group row">
        <div class="col-6">
          <label for="condition">Condition:</label>
          <select v-model="condition" id="condition" required>
            <option disabled value="">Select item condition</option>
            <option v-for="c in conditions" :key="c">{{ c }}</option>
          </select>
        </div>
        <div class="col-6">
          <label for="size">Size:</label>
          <select v-model="size" id="size" required>
            <option disabled value="">Select item size</option>
            <option v-for="s in sizes" :key="s">{{ s }}</option>
          </select>
        </div>
      </div>
      <div class="form-group row">
        <div class="col-6">
          <label for="brand">Brand:</label>
          <input type="text" id="brand" v-model="brand" placeholder="Brand of item" required />
        </div>
        <div class="col-6">
          <label for="gender">Gender:</label>
          <select v-model="gender" id="gender" required>
            <option disabled value="">Gender suitable for:</option>
            <option v-for="g in genders" :key="g">{{ g }}</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Deal Method:</label>
        <br>
        <label for="meetup">
          <input type="checkbox" id="meetup" value="Meet-up" v-model="dealMethod" />
          Meet-up
        </label>
        <label for="delivery">
          <input style="margin-left: 5px;" type="checkbox" id="delivery" value="Delivery" v-model="dealMethod" />
          Delivery
        </label>
      </div>      
      <div class="form-group">
        <label for="location">Location:</label>
        <input type="text" id="location" v-model="location" placeholder="Enter item location" required />
      </div>
      <button type="submit" class="btn btn-primary" style="background-color: black;">Sell</button>
    </form>
  </section>
</template>


<script lang="ts" setup>
import { ref } from 'vue';
import { auth, db, storage } from '../lib/firebaseConfig';
import { doc, setDoc, collection, getDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import LoadingOverlay from '@/components/LoadingOverlay.vue';

const categories = ['Shoes', 'Accessories', 'Belt', 'T-shirt', 'Jeans', 'Outerwear'];
const conditions = ['Brand new', 'Like new', 'Lightly used', 'Well used', 'Heavily used'];
const sizes = ['XXS / EU 44 / UK 34 / US 34','XS / EU 46 / UK 36 / US 36','S / EU 48 / UK 38 / US 38','M / EU 50 / UK 40 / US 40','L / EU 52 / UK 42 / US 42','XL / EU 54 / UK 44 / US 44','XXL / EU 56 / UK 46 / US 46','XXXL / EU 58 / UK 48 / US 48', 'Free Size', 'Others'];
const genders = ['Male', 'Female', 'Unisex'];

const isLoading = ref(false);
const itemName = ref('');
const itemDescription = ref('');
const itemPrice = ref(0);
const chosenCat = ref('');
const selectedFiles = ref<File[]>([]);
const previewImages = ref({ front: '', back: '', tag: '' }); // Reactive object for image previews
const userName = ref('');

// Additional Fields
const gender = ref('');
const brand = ref('');
const size = ref('');
const condition = ref('');
const dealMethod = ref([]);
const location = ref('');
const date = new Date();
const listedDate = date.toISOString().split('T')[0];
const itemPhotoURLs: string[] = [];

const handleSinglePhoto = (event: Event, position: string) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length) {
    const file = target.files[0];
    selectedFiles.value.push({ file, position });
    
    // Generate a preview URL and update the previewImages object
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImages.value[position] = e.target.result as string; // Set the preview image
    };
    reader.readAsDataURL(file); // Read the file as a data URL
  }
};

const handleUpload = async () => {
  const currentUser = auth.currentUser;
  if (currentUser && selectedFiles.value.length === 3) {
    const userDoc = doc(db, 'users', currentUser.uid);
    const userSnapshot = await getDoc(userDoc);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      userName.value = userData.username || '';
    } else {
      alert("Set up your username first!");
      return;
    }
    
    isLoading.value = true; // Start loading overlay
    console.log("handle upload" + chosenCat.value)
    const itemDocRef = doc(collection(db, chosenCat.value));
    const itemUID = itemDocRef.id;

    const sellData = {
      userId: currentUser.uid,
      userName: userName.value,
      itemName: itemName.value,
      description: itemDescription.value,
      itemPrice: itemPrice.value,
      itemPhotoURLs: [], // Initialize an array for photo URLs
      condition: condition.value,
      dealMethod: dealMethod.value,
      location: location.value,
      listedDate: listedDate,
      brand: brand.value,
      size: size.value,
      gender: gender.value,
    };

    await setDoc(itemDocRef, sellData, { merge: true });

    // Upload all selected photos
    await Promise.all([
      handlePhotoUpload(itemUID, selectedFiles.value[0], 'front'),
      handlePhotoUpload(itemUID, selectedFiles.value[1], 'back'),
      handlePhotoUpload(itemUID, selectedFiles.value[2], 'tag'),
    ]);
    
    updateUpload(itemUID, itemPhotoURLs);
    alert(`Item uploaded successfully! Item UID: ${itemUID}`);
    isLoading.value = false;
  } else {
    alert('User is not logged in or incorrect number of files selected.');
    isLoading.value = false;
  }
};

const handlePhotoUpload = async (itemUID: string, file: File, position: string) => {
  const storagePath = `item_photos/${itemUID}/${position}`; // Naming the files as front.jpg, back.jpg, tag.jpg
  const photoRef = storageRef(storage, storagePath);

  console.log(file.file);
  await uploadBytes(photoRef, file.file);
  const downloadURL = await getDownloadURL(photoRef);
  itemPhotoURLs.push(downloadURL);
  console.log(downloadURL);
  // Update Firestore document with the photo URL
};

const updateUpload = async (itemUID: string, itemPhotoURLs: unknown) => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    console.log("update upload" + chosenCat.value)
    const itemDocRef = doc(collection(db, chosenCat.value), itemUID);
    
    // Update Firestore document with the new photo URL
    await setDoc(itemDocRef, {
      itemPhotoURLs: itemPhotoURLs, // Append to the array
    }, { merge: true });

    const uploadData = {
      userId: currentUser.uid,
      userName: userName.value,
      itemName: itemName.value,
      description: itemDescription.value,
      itemPrice: itemPrice.value,
    };

    updateLocalStorage({ id: itemUID, ...uploadData });
    isLoading.value = false;

    // Clear form fields
    itemName.value = '';
    itemDescription.value = '';
    itemPrice.value = 0;
    chosenCat.value = '';
    selectedFiles.value = []; // Clear selected files
    condition.value = '';
    dealMethod.value = [];
    location.value = '';
    brand.value = '';
    size.value = '';
    gender.value = '';
    previewImages.value = { front: '', back: '', tag: '' }; // Clear image previews
  } else {
    alert('User is not logged in.');
    isLoading.value = false;
  }
};

const updateLocalStorage = (newItem: JSON) => {
  const cachedProducts = localStorage.getItem('listing');
  const products = cachedProducts ? JSON.parse(cachedProducts) : [];
  
  products.push(newItem);
  localStorage.setItem('listing', JSON.stringify(products));
};
</script>

<style scoped>
.head{
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

.upload-form {
  max-width: 50%;
  padding-left: 130px;
  padding-right: 130px;
  margin: auto;
  border-left: 1px black solid;
  border-right: 1px black solid;
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 400;
  height: 100vh;
}

.form-group {
  margin-bottom: 15px;
}

input[type="text"],
input[type="file"],
input[type="number"],
textarea,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

textarea {
  resize: vertical; /* Allow vertical resizing */
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

@media (max-width: 992px) {
  .upload-form {
  padding: 20px;
  margin: 0px;
  max-width: 100%;
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 400;
  } 

  .form-group {
    margin-bottom: 10px;
  }

  .upload-section{
    padding: 0px;
    margin: 0px;
  }

  button {
    padding: 10px; /* Adjust button padding */
  }
}
.custom-file-upload {
  display: inline-block;
  cursor: pointer;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f8f9fa; /* Light background */
}

.custom-file-upload input {
  display: none; /* Hide the default file input */
}

</style>

  