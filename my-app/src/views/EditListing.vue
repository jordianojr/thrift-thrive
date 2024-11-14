<template>
  <!-- for alerts popping in and out-->
  <CustomAlert :visible="showAlert" :message="alertMessage" :alert-type="alertType" :timeout="3000"
    @update:visible="showAlert = $event" />

  <section class="upload-section container-fluid px-0">
    <LoadingOverlay :isLoading="isLoading" message="Fetching your item details..." />
    <LoadingOverlay :isLoading="!isSaved" message="Saving your new item details..." />
    <div class="header-container">
      <h3 class="head">Edit Listing</h3>
    </div>
    <form @submit.prevent="handleSave" class="upload-form">
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
            ref="fileInputRef"
          />
          <div class="file-uploads mt-3">
            <div class="file-item" v-for="(file, index) in files" :key="index">
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
          <input type="number" id="item-price" v-model="itemPrice" placeholder="Enter item price" required />
        </div>
        <div class="col-6">
          <label for="gender">Gender:</label>
          <select v-model="gender" id="gender" required>
            <option disabled value="">Gender suitable for:</option>
            <option v-for="g in genders" :key="g">{{ g }}</option>
          </select>
        </div>
        <!-- <div class="col-6">
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
        </div> -->
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
      </div>
      <!-- <div class="form-group">
        <label for="location">Location:</label>
        <input type="text" id="location" v-model="location" placeholder="Enter item location" required />
      </div> -->
      <button type="submit" class="btn btn-primary" style="background-color: black;">Save</button>
    </form>
  </section>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { routerKey, useRoute, useRouter } from "vue-router";
import { db, auth, storage } from "@/lib/firebaseConfig"; // Adjust the path as necessary
import { collection, getDoc, setDoc, doc, documentId } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import CustomAlert from '@/components/CustomAlert.vue';

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

const route = useRoute();
const router = useRouter();
const itemId = ref(route.params.id as string);
const item = ref<any>({});
const isLoading = ref(true);
const isSaved = ref(true);

const itemName = ref('');
const itemDescription = ref('');
const itemPrice = ref(0);
const chosenCat = ref('');
const images = ref([]);
const selectedFiles = ref<{ file: File; position: string }[]>([]);
const userName = ref('');
const userId = ref('');
const gender = ref('');
const brand = ref('');
const size = ref('');
const condition = ref('');
const dealMethod = ref<string[]>([]);
const location = ref('');
const itemPhotoURLs = ref<string[]>([]);
const fileInputRef = ref<HTMLInputElement | null>(null);
const categories = ['Shoes', 'Accessories', 'Belt', 'T-shirt', 'Jeans', 'Outerwear'];
const conditions = ['Brand new', 'Like new', 'Lightly used', 'Well used', 'Heavily used'];
// const sizes = ['XXS / EU 44 / UK 34 / US 34', 'XS / EU 46 / UK 36 / US 36', 'S / EU 48 / UK 38 / US 38', 'M / EU 50 / UK 40 / US 40', 'L / EU 52 / UK 42 / US 42', 'XL / EU 54 / UK 44 / US 44', 'XXL / EU 56 / UK 46 / US 46', 'XXXL / EU 58 / UK 48 / US 48', 'Free Size', 'Others'];
const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size', 'Others'];
const genders = ['Male', 'Female', 'Unisex'];

const files = ref<File[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);

const getPreviewUrl = (file: File | string) => {
  // Check if file is a string (URL), then return it directly
  if (typeof file === 'string') {
    return file;
  }

  // Ensure file is a File or Blob before creating an object URL
  if (file instanceof File) {
    return URL.createObjectURL(file);
  }

  // Return null or a default placeholder if file type is invalid
  console.warn('Invalid file type:', file);
  return null;
};

// Handle photo upload
const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const filesArray = Array.from(target.files);
    files.value = [...files.value, ...filesArray];
    
    // Update file input state
    const dataTransfer = new DataTransfer();
    files.value.forEach(file => {
      dataTransfer.items.add(file);
    });
    
    target.files = dataTransfer.files;
  }
};

// Remove photo
const removeFile = (index: number) => {
  files.value.splice(index, 1);
  
  // Update file input state
  const dataTransfer = new DataTransfer();
  files.value.forEach(file => {
    dataTransfer.items.add(file);
  });
  
  if (fileInput.value) {
    fileInput.value.files = dataTransfer.files;
  }
};

const fetchItem = async () => {
  const collectionsToCheck = ['Shoes', 'Accessories', 'Belt', 'T-shirt', 'Jeans', 'Outerwear'];

    try {
        for (const collectionName of collectionsToCheck) {
            const postRef = doc(db, collectionName, itemId.value); // Replace with the correct collection and document ID
        const postSnapshot = await getDoc(postRef);
        if (postSnapshot.exists()) {
            const postData = postSnapshot.data();
            itemName.value = postData?.itemName || '';
            itemDescription.value = postData?.description || '';
            itemPrice.value = postData?.itemPrice || 0;
            condition.value = postData?.condition || '';
            size.value = postData?.size || '';
            brand.value = postData?.brand || '';
            gender.value = postData?.gender || '';
            dealMethod.value = postData?.dealMethod || [];
            files.value = postData?.itemPhotoURLs || [];
            chosenCat.value = collectionName;
            location.value = postData?.location || '';
            userName.value = postData?.userName || '';
            userId.value = postData?.userId || '';
            itemPhotoURLs.value = postData?.itemPhotoURLs || [];
        }
    }isLoading.value = false;
    } catch (error) {
        console.error('Error fetching products:', error);
    }
};

const handleSave = async () => {
  if (!itemName.value || itemName.value.length < 1) {
      alert('Name must be at least 1 character long');
      return;
    }
  
    if (!itemDescription.value || itemDescription.value.length < 1) {
      alert('Description must be at least 1 character long');
      return;
    }

    if (!files.value || files.value.length < 1) {
      alert('Upload must have at least 1 photo');
      return;
    }
  try {
    isSaved.value = false;

    // Create or update item document
    const itemDocRef = doc(db, chosenCat.value, itemId.value); // Replace with the correct collection and document ID

    const newFiles:any = [];
        const oldUrls:any = [];
        files.value.forEach(file => {
          if (file instanceof File) {
            newFiles.push(file);
          }else{
            oldUrls.push(file);
          }
        });
        const saveFolder = chosenCat.value.toLowerCase() + '_photos/' + itemId.value;
        const photoUrls = newFiles.length
          ? await Promise.all(newFiles.map(async (file: Blob | ArrayBuffer | Uint8Array, index: number) => {
              const storage = getStorage();
              const photoRef = storageRef(storage, `${saveFolder}/photo-${index + oldUrls.length}.webp`);
              const snapshot = await uploadBytes(photoRef, file);
              return await getDownloadURL(snapshot.ref);
            }))
          : [];
        const updateUrls = oldUrls.concat(photoUrls);   
        console.log('Update URLs:', updateUrls); 
    // Prepare item data
    const itemData = {
      userId: userId.value,
      userName: userName.value,
      itemName: itemName.value,
      description: itemDescription.value,
      itemPrice: itemPrice.value,
      condition: condition.value,
      dealMethod: dealMethod.value,
      location: location.value,
      brand: brand.value,
      size: size.value,
      gender: gender.value,
      itemPhotoURLs: updateUrls.length ? updateUrls : files.value.map(file => file),
    };

    // Save to Firestore
    await setDoc(itemDocRef, itemData, { merge: true });

    //alert(`Item ${itemId.value ? 'updated' : 'uploaded'} successfully!`);
    showCustomAlert(`Item ${itemId.value ? 'updated' : 'uploaded'} successfully!`, 'success');
    router.push({ name: 'profile' });
  } catch (error) {
    console.error('Error during upload:', error);
    //alert('An error occurred during upload. Please try again.');
    showCustomAlert('An error occurred during upload. Please try again.', 'error');
  } finally {
    isSaved.value = true;
  }
};

onMounted(() => {
  fetchItem();
});
</script>

<style scoped>
.header-container {
  border-bottom: 1px solid black;
  width: 50%;
  /* Match the form width */
  margin: 0 auto;
  border-left: 1px black solid;
  border-right: 1px black solid;
}

.head {
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
  resize: vertical;
  /* Allow vertical resizing */
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
  .upload-form {
    padding: 20px;
    margin: 0px;
    max-width: 100%;
    font-family: 'Helvetica Neue', sans-serif;
    font-weight: 400;
  }

  .form-group {
    margin-top: 10px;
  }

  .upload-section {
    padding-bottom: 0px;
    margin: 0px;
  }

  button {
    padding: 10px;
    /* Adjust button padding */
  }
}

.custom-file-upload {
  display: inline-block;
  cursor: pointer;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f8f9fa;
  /* Light background */
}

.custom-file-upload input {
  display: none;
  /* Hide the default file input */
}
</style>
