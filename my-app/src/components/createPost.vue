<template>
    <div class="row" style="margin-top: 130px;">
      <div class="col-md-1 col-12"></div>
  
      <div class="col-md-3 col-sm-12">
        <h3>Preview</h3>
        <div class="preview-card">
          <div :id="`carousel-preview`" class="carousel slide" :class="{ 'empty-carousel': previewImages.length === 0 }" data-bs-ride="carousel">
            <div class="carousel-inner">
              <div class="carousel-item" v-for="(image, index) in previewImages" :key="index" :class="{ active: index === 0 }">
                <img :src="image" class="d-block w-100 blog-image" :alt="`Slide ${index + 1}`">
              </div>
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carousel-preview" data-bs-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carousel-preview" data-bs-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Next</span>
            </button>
          </div>
          <div class="post-content p-4">
            <h5 class="blog-title text-truncate-4">{{ title || 'Untitled' }}</h5>
            <p class="blog-caption text-truncate-6">{{ caption || 'No caption provided' }}</p>
          </div>
        </div>
      </div>
  
      <div class="col-md-1 col-12"></div>
  
      <div class="col-md-6 col-sm-12">
        <h3>Create Post</h3>
        <form @submit.prevent="createPost" class="create-post-form">
          <div class="form-group mb-3">
            <label for="title">Title</label>
            <textarea class="form-control" id="title" v-model="title" placeholder="Write a title" required></textarea>
          </div>
          <div class="form-group mb-3">
            <label for="caption">Caption</label>
            <textarea class="form-control" id="caption" v-model="caption" rows="4" placeholder="Write a caption" required></textarea>
          </div>
          <div class="form-group">
            <label for="photos">Photos</label>
            <input type="file" class="form-control" id="photos" ref="fileInput" @change="handlePhotoUpload" multiple accept="image/*" required/>
            <div class="file-uploads mt-3">
              <div class="file-item" v-for="(file, index) in files" :key="index">
                <img :src="getPreviewUrl(file)" alt="Preview" class="preview-image" />
                <button class="remove-btn" @click.prevent="removeFile(index)">×</button>
              </div>
            </div>
          </div>
          <button 
            type="submit" 
            class="btn btn-outline-elegant text-uppercase px-4 py-2 mt-3 border-2 submit-btn"
            :disabled="!isFormValid || isSubmitting"
          >
            {{ isSubmitting ? 'Posting...' : 'Post' }}
          </button>
        </form>
      </div>
  
      <div class="col-md-1 col-12"></div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
  import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { auth, db } from '@/lib/firebaseConfig';
  
  const router = useRouter();
  const title = ref('');
  const caption = ref('');
  const files = ref<File[]>([]);
  const fileInput = ref<HTMLInputElement | null>(null);
  const isSubmitting = ref(false);
  
  
  const previewImages = computed(() => {
    return files.value.map(file => URL.createObjectURL(file));
  });
  
  const isFormValid = computed(() => {
    return title.value.length >= 1 && 
           caption.value.length >= 1 && 
           files.value.length >= 1;
  });
  
  const getPreviewUrl = (file: File) => {
    return URL.createObjectURL(file);
  };
  
  const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const filesArray = Array.from(target.files);
    files.value = [...files.value, ...filesArray];
    
    // Create a new DataTransfer object
    const dataTransfer = new DataTransfer();
    
    // Add all files to the DataTransfer object
    files.value.forEach(file => {
      dataTransfer.items.add(file);
    });
    
    // Update the file input's files
    target.files = dataTransfer.files;
  }
};

const removeFile = (index: number) => {
  files.value.splice(index, 1);
  
  // Create a new DataTransfer object
  const dataTransfer = new DataTransfer();
  
  // Add remaining files to the DataTransfer object
  files.value.forEach(file => {
    dataTransfer.items.add(file);
  });
  
  // Update the file input's files
  const fileInput = document.getElementById('photos') as HTMLInputElement;
  if (fileInput) {
    fileInput.files = dataTransfer.files;
  }
};

  
  const createPost = async () => {
  // Validate all form fields before submission
  if (!title.value || title.value.length < 1) {
    alert('Title must be at least 1 character long');
    return;
  }

  if (!caption.value || caption.value.length < 1) {
    alert('Caption must be at least 1 character long');
    return;
  }

  if (files.value.length === 0) {
    alert('Please upload at least one image');
    return;
  }

  try {
    isSubmitting.value = true;
    const user = auth.currentUser;
    if (user) {
      // Get the current editorial count
      const countDocRef = doc(db, 'EditorialCount', 'count');
      const countDoc = await getDoc(countDocRef);
      const currentEditorialCount = countDoc.data()?.count || 0;
      const newEditorialCount = currentEditorialCount + 1;

      // Create the document ID
      const documentId = `ed${newEditorialCount}`;
      const editorialDocRef = doc(db, 'Editorial', documentId);
      
      // Ensure a consistent storage path
      const storage = getStorage();
      const editorialStorageRef = storageRef(storage, `editorial_photos/${documentId}`);

      // Use Promise.all with a timeout to prevent long-running uploads
      const photoUrls = await Promise.all(
        files.value.map(async (photo, index) => {
          // Create a more specific path for each photo
          const photoRef = storageRef(editorialStorageRef, `photo-${index + 1}.webp`);
          
          // Upload the photo
          const snapshot = await uploadBytes(photoRef, photo);
          
          // Get the download URL
          return await getDownloadURL(snapshot.ref);
        })
      );

      // Create new editorial document in Firestore with the specific ID
      await setDoc(editorialDocRef, {
        title: title.value.toUpperCase(),
        caption: caption.value,
        images: photoUrls,
        sellerId: user.uid,
        date: new Date().toISOString(),
      });

      const userDoc = doc(db, 'users', auth.currentUser.uid);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const updatedPosts = [...userData.userPosts, documentId];

        await setDoc(userDoc, { userPosts: updatedPosts }, { merge: true });
      }
      // Update the EditorialCount document
      await updateDoc(countDocRef, { count: newEditorialCount });
      
      // Redirect to Editorial page
      router.push({ name: 'editorial' });
    }
  } catch (error) {
    console.error('Error creating post:', error);
    alert('Failed to create post. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};
  </script>
  
  <style scoped>

h3{
  text-transform: uppercase;
  color: black;
  font-size: 1.2rem;
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 500;
  letter-spacing: 1px;
  margin-bottom: 1rem;
}

.create-post-form {
  background-color: white;
  margin-top: 1.4rem;
  color: rgb(25, 25, 25);
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 400;
  text-align: left;
  font-size: 0.875rem;
}

.preview-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.blog-image {
  width: 100%;
  aspect-ratio: 3/4;
  object-fit: cover;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.carousel {
  background: #000;
}

.empty-carousel {
  background-color: #f2f2f2;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  aspect-ratio: 3/4;
  object-fit: cover;
}

.carousel-item {
  aspect-ratio: 4/3;
}

.post-content {
  padding: 2rem !important;
}

.text-truncate-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: black !important;
  font-weight: 100;
  word-wrap: break-word;
  white-space: normal;
}

.text-truncate-6 {
  display: -webkit-box;
  -webkit-line-clamp: 6;
  line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: black !important;
  font-weight: 100;
  word-wrap: break-word;
  white-space: normal;
}

h5.blog-title {
  font-weight: 400;
  color: black;
  font-size: 1.2rem;
  margin-bottom: 1rem;
  word-wrap: break-word;
  white-space: normal;
}

.blog-caption {
  font-family: 'Helvetica Neue', sans-serif;
  color: black;
  font-size: 0.875rem;
  font-weight: 300;
  word-wrap: break-word;
  white-space: normal;
}

.create-post-form {
  background-color: white;
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

.file-uploads {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
}

.submit-btn {
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}


.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn {
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 500;
  background-color: black;
  letter-spacing: 1px;
  color: white;
  transition: all 0.3s ease;
  text-transform: uppercase;
  width: 100%;
  margin-top: 20px;
  text-align: center;
  font-size: 0.875rem;
}

.submit-btn:hover {
  color: black;
  background-color: white;
  border: black 1px solid;
}

</style>