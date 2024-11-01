<template>
    <div class="row">
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
            <h5 class="blog-title text-truncate-2">{{ title }}</h5>
            <p class="blog-caption text-truncate-4">{{ caption }}</p>
          </div>
        </div>
      </div>
    
      <div class="col-md-1 col-12"></div>
    
      <div class="col-md-6 col-sm-12">
        <h3>Create Post</h3>
        <form @submit.prevent="createPost" class="create-post-form">
          <div class="form-group">
            <label for="documentName">Document Name</label>
            <input type="text" class="form-control" id="documentName" v-model="documentName" placeholder="Enter document name" required />
          </div>
          <div class="form-group">
            <label for="title">Title</label>
            <input type="text" class="form-control" id="title" v-model="title" placeholder="Write a title" required />
          </div>
          <div class="form-group">
            <label for="caption">Caption</label>
            <textarea class="form-control" id="caption" v-model="caption" rows="4" placeholder="Write a caption" required></textarea>
          </div>
          <div class="form-group">
            <label for="photos">Photos</label>
            <input type="file" class="form-control" id="photos" @change="handlePhotoUpload" multiple accept="image/*" required />
            
            <div class="file-uploads mt-3">
              <div class="file-item" v-for="(file, index) in files" :key="index">
                <img :src="getPreviewUrl(file)" alt="Preview" />
                <button class="remove-btn" @click.prevent="removeFile(index)">x</button>
              </div>
            </div>
          </div>
          <button type="submit" class="btn btn-primary mt-3">Create Post</button>
        </form>
      </div>
    
      <div class="col-md-1 col-12"></div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
  import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { auth, db } from '@/lib/firebaseConfig';
  
  const router = useRouter();
const documentName = ref('');
const title = ref('');
const caption = ref('');
const files = ref<File[]>([]);
  
const previewImages = computed(() => {
  return files.value.map(file => URL.createObjectURL(file));
});
  
const closeModal = () => {
  router.push({ name: 'Editorial' });
};
  
const getPreviewUrl = (file: File) => {
  return URL.createObjectURL(file);
};
  
const handlePhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    files.value.push(...Array.from(target.files));
  }
};
  
const removeFile = (index: number) => {
  files.value.splice(index, 1);
};
  
const createPost = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      const currentEditorialCount = (await getDoc(doc(db, 'EditorialCount', 'count'))).data()?.count || 0;
      const newEditorialCount = currentEditorialCount + 1;
  
      const editorialDocRef = doc(db, 'Editorial', `ed${newEditorialCount}`);
      const editorialStorageRef = storageRef(getStorage(), `editorial_photos/ed${newEditorialCount}`);
  
      // Upload photos to storage
      for (const [index, photo] of files.value.entries()) {
        const photoRef = storageRef(editorialStorageRef, `file-${index + 1}.jpg`);
        await uploadBytes(photoRef, photo);
      }
  
      // Get download URLs for uploaded photos
      const photoUrls = await Promise.all(
        files.value.map(async (_, index) => {
          const photoRef = storageRef(editorialStorageRef, `file-${index + 1}.jpg`);
          return await getDownloadURL(photoRef);
        })
      );
  
      // Create new editorial document in Firestore
      await addDoc(collection(db, 'Editorial'), {
        id: editorialDocRef.id,
        documentName: documentName.value,
        title: title.value.toUpperCase(),
        caption: caption.value,
        images: photoUrls,
        sellerId: user.uid,
        date: new Date().toISOString(),
      });
  
      // Update the EditorialCount document
      await updateDoc(doc(db, 'EditorialCount', 'count'), { count: newEditorialCount });
  
      closeModal();
      router.push({ name: 'Editorial' });
    }
  } catch (error) {
    console.error('Error creating post:', error);
  }
};
</script>
  
  <style scoped>

    .create-post-form {
    background-color: white;
    border: 1px solid #e6e6e6;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    padding: 2rem;
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
}
  
  .carousel-item {
    aspect-ratio: 4/3;
  }
  
  .post-content {
    padding: 2rem !important;
  }
  
  .text-truncate-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .text-truncate-4 {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: black !important;
    font-weight: 100;
  }
  
  h5.blog-title {
    font-weight: 400;
    color: black;
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
  
  .blog-caption {
    font-family: 'Helvetica Neue', sans-serif;
    color: black;
    font-size: 0.875rem;
    font-weight: 300;
  }
  
  .create-post-form {
    background-color: white;
  }

  .file-uploads {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
  
.file-item {
  position: relative;
  width: 100px;
  height: 100px;
}
  
.file-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
  
.file-item .remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
</style>
