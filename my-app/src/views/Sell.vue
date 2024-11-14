<template>
  <section class="upload-section container-fluid px-0">
    <LoadingOverlay :isLoading="isLoading" message="Uploading your item..." />
    <div class="header-container">
      <h3 class="head">Sell Item</h3>
    </div>
    <form @submit.prevent="handleUpload" class="upload-form">
        <div class="form-group">
          <label for="item-name">Name:</label>
          <input type="text" id="item-name" v-model="itemName" placeholder="Enter item name" required />
        </div>
        <div class="form-group">
          <label for="item-description">Description:</label>
          <textarea id="item-description" v-model="itemDescription" placeholder="Enter item description" required></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Upload Photos:</label>
          <input 
            type="file" 
            class="form-control" 
            @change="handlePhotoUpload" 
            accept="image/*" 
            multiple
            required 
            ref="fileInputRef"
          />
          <div class="file-uploads mt-3">
            <div class="file-item" v-for="(file, index) in selectedFiles" :key="index">
              <img :src="getPreviewUrl(file)" alt="Preview" class="preview-image" />
              <button class="remove-btn" @click.prevent="removeFile(index)">×</button>
            </div>
          </div>
          <small class="form-text text-muted">Please upload your photos</small>
        </div>
      <!-- Other fields here -->
      <div class="form-group row">
        <div class="col-6">
          <label for="item-price">Price:</label>
          <input type="number" id="item-price" v-model="itemPrice" placeholder="Enter item price (inc. delivery price)" required />
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
      <!-- <div class="form-group">
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
      </div>       -->
      <!-- <div class="form-group">
        <label for="location">Location:</label>
        <input type="text" id="location" v-model="location" placeholder="Enter item location" required />
      </div> -->
      <button type="submit" class="btn btn-primary" style="background-color: black;">Sell</button>
    </form>
  </section>
</template>


<script lang="ts" setup>
import { ref } from 'vue';
import { auth, db, storage } from '../lib/firebaseConfig';
import { doc, setDoc, collection, getDoc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import LoadingOverlay from '@/components/LoadingOverlay.vue';
import { useRoute } from 'vue-router';

// Get route for post ID
const route = useRoute();
const postId = ref(route.params.id as string);

const categories = ['Shoes', 'Accessories', 'Belt', 'T-shirt', 'Jeans', 'Outerwear'];
const conditions = ['Brand new', 'Like new', 'Lightly used', 'Well used', 'Heavily used'];
// const sizes = ['XXS / EU 44 / UK 34 / US 34', 'XS / EU 46 / UK 36 / US 36', 'S / EU 48 / UK 38 / US 38', 'M / EU 50 / UK 40 / US 40', 'L / EU 52 / UK 42 / US 42', 'XL / EU 54 / UK 44 / US 44', 'XXL / EU 56 / UK 46 / US 46', 'XXXL / EU 58 / UK 48 / US 48', 'Free Size', 'Others'];
const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size', 'Others'];
const genders = ['Male', 'Female', 'Unisex'];

// Form state
const isLoading = ref(false);
const itemName = ref('');
const itemDescription = ref('');
const itemPrice = ref(0);
const chosenCat = ref('');
const selectedFiles = ref<{ file: File; position: string }[]>([]);
const previewImages = ref<Record<string, string>>({});
const userName = ref('');
const gender = ref('');
const brand = ref('');
const size = ref('');
const condition = ref('');
const dealMethod = ref<string[]>([]);
const location = ref('');
const itemPhotoURLs = ref<string[]>([]);
const fileInputRef = ref<HTMLInputElement | null>(null);


// File handling functions
const getPreviewUrl = (file: { file: File }) => {
  return URL.createObjectURL(file.file);
};

const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const filesArray = Array.from(target.files);
    const formattedFiles = filesArray.map(file => ({
      file: file,
      position: selectedFiles.value.length.toString()
    }));
    selectedFiles.value = [...selectedFiles.value, ...formattedFiles];
    
    // Update preview images
    formattedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          previewImages.value[`photo${selectedFiles.value.length - formattedFiles.length + index}`] = e.target.result as string;
        }
      };
      reader.readAsDataURL(file.file);
    });

    // Update the file input display
    updateFileInputDisplay();
  }
};

const uploadPhoto = async (itemId: string, file: File, photoType: string): Promise<string> => {
  const storagePath = `item_photos/${itemId}/${photoType}`;
  const photoRef = storageRef(storage, storagePath);

  try {
    await uploadBytes(photoRef, file);
    const downloadURL = await getDownloadURL(photoRef);
    return downloadURL;
  } catch (error) {
    console.error(`Error uploading ${photoType}:`, error);
    throw error;
  }
};

const handleUpload = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    alert('User is not logged in.');
    return;
  }

  if (selectedFiles.value.length === 0) {
    alert('Please select at least one photo.');
    return;
  }

  try {
    isLoading.value = true;
    
    // Get user data
    const userDoc = doc(db, 'users', currentUser.uid);
    const userSnapshot = await getDoc(userDoc);
    if (!userSnapshot.exists()) {
      alert("Please set up your username first!");
      return;
    }
    
    const userData = userSnapshot.data();
    userName.value = userData.username || '';

    // Create or update item document
    const itemDocRef = postId.value ? 
      doc(collection(db, chosenCat.value), postId.value) : 
      doc(collection(db, chosenCat.value));
    
    const itemId = postId.value || itemDocRef.id;

    // Upload photos and get URLs
    const uploadPromises = selectedFiles.value.map((file, index) => 
      uploadPhoto(itemId, file.file, `photo${index}`)
    );

    const uploadedURLs = await Promise.all(uploadPromises);
    itemPhotoURLs.value = uploadedURLs;

    // Prepare item data
    const itemData = {
      userId: currentUser.uid,
      userName: userName.value,
      itemName: itemName.value,
      description: itemDescription.value,
      itemPrice: itemPrice.value,
      condition: condition.value,
      dealMethod: dealMethod.value,
      location: location.value,
      listedDate: new Date().toISOString().split('T')[0],
      brand: brand.value,
      size: size.value,
      gender: gender.value,
      itemPhotoURLs: itemPhotoURLs.value,
    };

    // Save to Firestore
    await setDoc(itemDocRef, itemData, { merge: true });

    // Update local storage
    updateLocalStorage({
      id: itemId,
      ...itemData
    });

    alert(`Item ${postId.value ? 'updated' : 'uploaded'} successfully!`);
    clearForm();
  } catch (error) {
    console.error('Error during upload:', error);
    alert('An error occurred during upload. Please try again.');
  } finally {
    isLoading.value = false;
  }
};

const clearForm = () => {
  itemName.value = '';
  itemDescription.value = '';
  itemPrice.value = 0;
  chosenCat.value = '';
  selectedFiles.value = [];
  condition.value = '';
  dealMethod.value = [];
  location.value = '';
  brand.value = '';
  size.value = '';
  gender.value = '';
  previewImages.value = {};
  itemPhotoURLs.value = [];
  
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
};

const updateLocalStorage = (newItem: Record<string, unknown>) => {
  const cachedProducts = localStorage.getItem('listing');
  const products = cachedProducts ? JSON.parse(cachedProducts) : [];
  products.push(newItem);
  localStorage.setItem('listing', JSON.stringify(products));
};

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
  const updatedPreviews: Record<string, string> = {};
  selectedFiles.value.forEach((file, i) => {
    updatedPreviews[`photo${i}`] = previewImages.value[`photo${i}`];
  });
  previewImages.value = updatedPreviews;

  // Update the file input display
  updateFileInputDisplay();
};

const updateFileInputDisplay = () => {
  if (!fileInputRef.value) return;

  // Create a new DataTransfer object
  const dataTransfer = new DataTransfer();
  
  // Add all current files to the DataTransfer object
  selectedFiles.value.forEach(({ file }) => {
    dataTransfer.items.add(file);
  });
  
  // Update the file input's files property
  fileInputRef.value.files = dataTransfer.files;
};


</script>

<style scoped>
.header-container {
  border-bottom: 1px solid black;
  width: 50%; /* Match the form width */
  margin: 0 auto;
  border-left: 1px black solid;
  border-right: 1px black solid;
}

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
}

.upload-form {
  max-width: 50%;
  padding-left: 80px;
  padding-right: 80px;
  padding-bottom: 25px;
  padding-top: 25px;
  margin: auto;
  border-left: 1px black solid;
  border-right: 1px black solid;
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 400;
  min-height: 100vh;
}

.form-group {
  padding-top: 15px;
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
  margin-top: 15px;
}

button:hover {
  background-color: #0056b3;
}

.file-uploads {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.file-item {
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  margin-bottom: 1rem;
}

.file-item img.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.file-item .remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: black;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-item .remove-btn:hover {
  transform: scale(1.1);
  background: #333;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 10px;
}

@media (max-width: 992px) {
  .header-container {
  width: 100%;
  margin: 0 auto;
  border-left: 0px;
  border-right: 0px;
}
  .upload-form {
  padding: 20px;
  margin: 0px;
  max-width: 100%;
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 400;
  border: 0px;
  } 

  .form-group {
    margin-top: 10px;
  }

  .upload-section{
    padding-bottom: 0px;
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

  