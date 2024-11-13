<template>
    <div class="row">
      <div v-if="blogPosts.length == 0" style="padding-bottom: 20px;" class="no-container">
          <p>You have no posts to edit yet.</p>
      </div>

      <template v-else>
  <div style="border-bottom: 1px black solid; margin-bottom: 40px;">
    <div class="d-flex flex-row overflow-auto">
      <div v-for="post in blogPosts" :key="post.id" class="blog-card-container">
        <div class="blog-card" @click="fetchPost(post.id)">
          <div :id="`carousel-${post.id}`" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
              <div class="carousel-item" v-for="(image, index) in getPostImages(post)" :key="index"
              :class="{ active: index === 0 }">
                <img :src="image" class="d-block w-100 blog-image" :alt="`Slide ${index + 1}`">
              </div>
            </div>
            <button class="carousel-control-prev" type="button" :data-bs-target="'#carousel-' + post.id"
                data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" :data-bs-target="'#carousel-' + post.id"
                data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
            </button>
          </div>
        </div>

        
          </div>
        </div>
      </div>

        <div class="row px-4 m-0">
            <div class="col-md-4 col-sm-12 px-4 py-2">
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
  
  
      <div class="col-md-8 col-sm-12 px-4 py-2">
        <h3>Edit Post</h3>
        <form @submit.prevent="updatePost" class="create-post-form">
          <div class="form-group mb-3">
            <label for="title">Title</label>
            <textarea class="form-control" id="title" v-model="title" required>{{ title }}</textarea>
          </div>
          <div class="form-group mb-3">
            <label for="caption">Caption</label>
            <textarea class="form-control" id="caption" v-model="caption" rows="4" required>{{ caption }}</textarea>
          </div>
          <div class="form-group">
            <label for="photos">Photos</label>
            <input type="file" class="form-control" id="photos" ref="fileInput" @change="handlePhotoUpload" multiple accept="image/*"/>
            <div class="file-uploads mt-3">
              <div class="file-item" v-for="(file, index) in files" :key="index">
                <img :src="getPreviewUrl(file)" alt="Preview" class="preview-image" />
                <button class="remove-btn" @click.prevent="removeFile(index)">×</button>
              </div>
            </div>
          </div>
          <button
            type="submit" 
            class="col-12 btn py-2 submit-btn"
            :disabled="!isFormValid || isSubmitting"
          >
            {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
          </button>
        </form>

            <button 
                @click = "deletePost"
                class="col-12 btn py-2 delete-btn"
                :disabled="!isFormValid || isDeleting"
              >
                {{ isDeleting ? 'Deleting...' : 'Delete' }}
              </button>
          </div>
      
          <div class="col-md-1 col-12"></div>
        </div>
      </template>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { doc, getDoc, deleteDoc, updateDoc, collection, query, where, getDocs, documentId } from 'firebase/firestore';
  import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { auth, db } from '@/lib/firebaseConfig';
  
  const router = useRouter();
  const editPostId = ref(''); // Replace with the actual post ID you want to edit
  const title = ref('');
  const caption = ref('');
  const files = ref<File[]>([]);
  const fileInput = ref<HTMLInputElement | null>(null);
  const isSubmitting = ref(false);
  const isDeleting = ref(false);
  
  const blogPosts = ref<any[]>([]);

  const previewImages = computed(() => {
    // If there are newly uploaded files, show those
    if (files.value.length > 0) {
      return files.value.map(file => {
        if (file instanceof File) {
          return URL.createObjectURL(file);
        }
        // For existing images that might be stored as URLs
        return typeof file === 'string' ? file : file.url;
      });
    }
    
    // Otherwise, if there's a selected post, show its images
    if (editPostId.value) {
      const selectedPost = blogPosts.value.find((post) => post.id === editPostId.value);
      return selectedPost ? getPostImages(selectedPost) : [];
    }
    
    return [];
  });
  
  const isFormValid = computed(() => {
    return title.value.length >= 1 && caption.value.length >= 1;
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
  
  const fetchPost = async (postId: string) => {
    try {
      editPostId.value = postId;  
      files.value = [];
      const postRef = doc(db, 'Editorial', postId); // Replace with the correct collection and document ID
      const postSnapshot = await getDoc(postRef);
      console.log('Post Snapshot:', postSnapshot.data());
      if (postSnapshot.exists()) {
        const postData = postSnapshot.data();
        title.value = postData?.title || '';
        caption.value = postData?.caption || '';
        files.value = postData?.image ? postData.image.map((url: string) => ({ url })) : [];
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  };
  
  const updatePost = async () => {
    if (!title.value || title.value.length < 1) {
      alert('Title must be at least 1 character long');
      return;
    }
  
    if (!caption.value || caption.value.length < 1) {
      alert('Caption must be at least 1 character long');
      return;
    }
  
    try {
      isSubmitting.value = true;
      const user = auth.currentUser;
      if (user) {
        // If new images are uploaded, handle the upload
        const photoUrls = files.value.length
          ? await Promise.all(files.value.map(async (file, index) => {
              const storage = getStorage();
              const photoRef = storageRef(storage, `editorial_photos/${postId}/photo-${index + 1}.webp`);
              const snapshot = await uploadBytes(photoRef, file);
              return await getDownloadURL(snapshot.ref);
            }))
          : [];
  
        // Update the editorial document in Firestore
        const editorialDocRef = doc(db, 'Editorial', editPostId.value);
        await updateDoc(editorialDocRef, {
          title: title.value.toUpperCase(),
          caption: caption.value,
          image: photoUrls.length ? photoUrls : files.value.map(file => file.url),
          sellerId: user.uid,
          date: new Date().toISOString(),
        });
  
        alert('Post updated successfully');
        router.push({ name: 'editorial' }); // Redirect after saving
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Please try again.');
    } finally {
      isSubmitting.value = false;
    }
  };
  
  const deletePost = async () => {
    if (!editPostId.value) {
      console.error('No post ID found for deletion.');
      return;
    }

    try {
      isDeleting.value = true;
      const user = auth.currentUser;
      if (user) {
        // Delete the editorial document from Firestore
        const editorialDocRef = doc(db, 'Editorial', editPostId.value);
        await deleteDoc(editorialDocRef);

        // Remove the post ID from the user's userPosts array
        const userDocRef = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          const updatedUserPosts = userData.userPosts.filter((id) => id !== editPostId.value);
          await updateDoc(userDocRef, { userPosts: updatedUserPosts });
        }

        alert('Post deleted successfully');
        router.push({ name: 'editorial' }); // Redirect after deleting
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      isDeleting.value = false;
    }
  };

  const fetchPostId = async () => {
    const uid = getUserUID(); // Get user UID

    if (!uid) {
        console.warn('No UID found, user might not be logged in.');
        return;
    }

    try {
        const userPosts = await getUserPosts(uid); // Get order history for the user
        console.log('User Posts:', userPosts);

        const fetchedProducts: any[] = [];

        // Fetch products based on the order history
        if (userPosts && userPosts.length > 0) {
        console.log('Posts for Query:', userPosts);
        const collectionRef = collection(db, "Editorial");

        // Check Firestore limit for the 'in' query
        if (userPosts.length > 10) {
            console.warn('Order history exceeds Firestore limit for `in` queries. Truncating to 10 items.');
            userPosts.length = 10; // Limit to 10 items for Firestore query
        }

        const q = query(collectionRef, where(documentId(), 'in', userPosts)); // Adjust based on actual field names
        const querySnapshot = await getDocs(q);
        console.log('Query Snapshot:', querySnapshot);

        if (querySnapshot.empty) {
            console.log('No matching posts found in the Editorial collection.');
        } else {
            querySnapshot.forEach((doc) => {
            fetchedProducts.push({ id: doc.id, ...doc.data() });
            });
        }
        } else {
        console.log('Order history is empty.');
        }

        blogPosts.value = fetchedProducts;  // Assign fetched products to the reactive variable
        console.log('Fetched Products:', blogPosts.value);
    } catch (error) {
        console.error('Error fetching products:', error);
    } 
  }

  const getUserUID = () => {
    return auth.currentUser ? auth.currentUser.uid : null; // Return user UID directly
    };

    // Function to get the order history for the current user
    const getUserPosts = async (uid: string) => {
    const userPosts: string[] = [];
    try {
        const userDoc = doc(db, 'users', uid);
        const userSnapshot = await getDoc(userDoc);

    if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        if (userData.userPosts) {
        userPosts.push(...userData.userPosts); // Assuming orderHistory is an array of product IDs
        }
    } 
    } catch (error) {
        console.error('Error fetching user posts:', error);
    }
    return userPosts;
    };

    const getPostImages = (post: any): string[] => {
  // First, check for 'images' array
    if (post.images && Array.isArray(post.images)) {
        return post.images;
    }

    // Fallback to previous checks
    if (post.image && typeof post.image === 'object') {
        return Object.values(post.image).filter(img => typeof img === 'string');
    }

    if (typeof post.image === 'string') {
        return [post.image];
    }

    return [];
    };

  onMounted(fetchPostId);
  onUnmounted(() => {
  // Cleanup any created object URLs
  if (files.value.length > 0) {
    files.value.forEach(file => {
      if (file instanceof File) {
        URL.revokeObjectURL(URL.createObjectURL(file));
      }
    });
  }
});
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


    .blog-card-container {
        min-width: 110px; /* Adjust this value based on your needs */
        width: 110px; /* Adjust this value based on your needs */
        margin-right: 1px;
      }

      .d-flex.flex-row::-webkit-scrollbar {
        display: none; /* Hides scrollbar for WebKit browsers */
      }

      .d-flex.flex-row {
        -ms-overflow-style: none;  /* Hides scrollbar for IE and Edge */
        scrollbar-width: none;  /* Hides scrollbar for Firefox */
      }

    .blog-card {
    max-width: 100%; /* Prevents card from overflowing */
    height: 100%;
    border-right: 1px black solid;
    }


    .blog-card:hover{
    cursor: pointer;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    .blog-image {
      width: 100%;
      aspect-ratio: 3/4;
      object-fit: cover;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .blog-card:hover .blog-image {
      opacity: 0.5;
    }

    .carousel {
      background: #000;
    }

    h3{
      text-transform: uppercase;
      color: black;
      font-size: 1.2rem;
      font-family: 'Helvetica Neue', sans-serif;
      font-weight: 500;
      letter-spacing: 1px;
      margin-bottom: 1rem;
    }
    
    .preview-card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
      aspect-ratio: 3/4;
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
  margin-top: 1.4rem;
  color: rgb(25, 25, 25);
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 400;
  text-align: left;
  font-size: 0.875rem;
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

    .submit-btn {
      font-family: 'Helvetica Neue', sans-serif;
      font-weight: 500;
      background-color: black !important;
      letter-spacing: 1px;
      color: white !important;
      transition: all 0.3s ease;
      text-transform: uppercase;
      margin-top: 20px;
      text-align: center;
      font-size: 0.875rem !important;
      border: black 1px solid !important;
      cursor: pointer;
    }

    .submit-btn:hover {
      color: black !important;
      background-color: white !important;
      border: black 1px solid !important;
    }

    .delete-btn {
      font-family: 'Helvetica Neue', sans-serif;
      font-weight: 500;
      background-color: red !important;
      letter-spacing: 1px;
      color: white !important;
      transition: all 0.3s ease;
      text-transform: uppercase;
      margin-top: 20px;
      text-align: center;
      font-size: 0.875rem !important;
      border: red 1px solid !important;
      cursor: pointer;
    }

    .delete-btn:hover {
      color: red !important;
      background-color: white !important;
      border: red 1px solid !important;
    }

</style>
      