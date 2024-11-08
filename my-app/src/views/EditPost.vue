<template>
    <div class="row" style="margin-bottom: 50px;">
        <div class="col-12">
            <h4 class="text-center" style="margin-top: -20px;, margin-bottom: 20px;">Your posts</h4>
        </div>
        <div
        v-for="post in blogPosts"
        :key="post.id"
        class="col-4 col-sm-3 col-md-2 col-lg-2"
        ref="blogCard"
        >
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

            <div class="post-content p-3"> <!-- Reduced padding for smaller size -->
            <h5 class="blog-title text-truncate-2">{{ post.title }}</h5>
            <p class="blog-caption text-truncate-4">{{ post.caption }}</p>
            </div>
        </div>
        </div>
    </div>

    <div class="row">
      <div class="col-md-1 col-12"></div>
      <div class="col-md-3 col-sm-12">
        <h4>Preview</h4>
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
        <h4>Edit Post</h4>
        <form @submit.prevent="updatePost" class="create-post-form">
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
            class="btn btn-outline-elegant text-uppercase px-4 py-2 mt-3 border-2 submit-btn"
            :disabled="!isFormValid || isSubmitting"
          >
            {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
          </button>
        </form>
      </div>
  
      <div class="col-md-1 col-12"></div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { doc, getDoc, updateDoc, collection, query, where, getDocs, documentId } from 'firebase/firestore';
  import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { auth, db } from '@/lib/firebaseConfig';
  
  const router = useRouter();
  const editPostId = ref(''); // Replace with the actual post ID you want to edit
  const title = ref('');
  const caption = ref('');
  const files = ref<File[]>([]);
  const fileInput = ref<HTMLInputElement | null>(null);
  const isSubmitting = ref(false);
  
  const blogPosts = ref<any[]>([]);

  const previewImages = computed(() => {
    return files.value.map(file => URL.createObjectURL(file));
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
  </script>
  
  <style scoped>

    .blog-card {
    max-width: 100%; /* Prevents card from overflowing */
    margin-bottom: 15px; /* Adds some spacing between cards */
    height: 300px;
    }
    .blog-card:hover{
    cursor: pointer;
    scale: 1.02;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 15px;
    }

    .blog-image {
    height: 200px; /* Adjust the image height to make it smaller */
    object-fit: cover; /* Ensures the image covers the space without distortion */
    }

    .blog-title {
    font-size: 1.1rem; /* Make the title smaller */
    }

    .blog-caption {
    font-size: 0.9rem; /* Make the caption smaller */
    height: 100px; /* Ensures the card takes up the full height */
    overflow-y: scroll;
    }

  </style>
  