<template>
    <div>
      <section class="display">
        <div class="common">
          <div class="img">
            <img src="../assets/home.png">
            <div class="img-overlay"></div>
          </div>
          <div class="text">
            <h2>Just</h2>
            <h5>Fashion</h5>
          </div>
          <div class="btn">
            <a href="./marketplace">Shop Now</a>
          </div>
        </div>
        <!-- <div class="women common">
          <div class="img">
            <img src="../assets/3.png">
            <div class="img-overlay"></div>
          </div>
          <div class="text">
            <h2>Women</h2>
            <h5>Fashion</h5>
          </div>
          <div class="btn">
            <a href="./marketplace/Female">Shop Now</a>
          </div>
        </div> -->
      </section>
      <section class="content">
          <SuggestionPanel />
      </section>
      <!-- <section class="content">
          <DisplayItem />
      </section> -->
    </div>
</template>

<script lang="ts" setup>
import gsap from 'gsap';
// import DisplayItem from '../components/DisplayItem.vue';
import SuggestionPanel from '../components/SuggestionPanel.vue';
import { ref, onMounted } from 'vue';
import { auth, db } from '../lib/firebaseConfig'; // Add storage import
import { doc, getDoc } from 'firebase/firestore';

const userEmail = ref('');
const name = ref('');
const photoURL = ref('');
const loading = ref(true);
const currentUser: User | null = auth.currentUser;

if (currentUser) {
  userEmail.value = currentUser.email || '';
}

const loadFromLocalStorage = () => {
  const cachedData = localStorage.getItem(`user_${currentUser.uid}`);
  if (cachedData) {
    const userData = JSON.parse(cachedData);
    userEmail.value = userData.email;
    name.value = userData.name;
    photoURL.value = userData.photoURL;
  }
};

const fetchUserData = async () => {
  const userDoc = doc(db, 'users', currentUser.uid);
  const userSnapshot = await getDoc(userDoc);
  loading.value = false;

  if (userSnapshot.exists()) {
    const userData = userSnapshot.data();
    userEmail.value = userData.email || '';
    name.value = userData.username || '';
    photoURL.value = userData.photoURL || '';
    
    localStorage.setItem(`user_${currentUser.uid}`, JSON.stringify({
      email: userEmail.value,
      name: userData.username,
      photoURL: photoURL.value,
    }));
  }
};

onMounted(async () => {
  const tl_img = gsap.timeline({ease: "power1.easeInOut"})

  .to(".home .img-overlay", {
    duration: 0.7,
    y: "100%"
  })
  // .to(".women .img-overlay", {
  //   duration: 1,
  //   y: "100%"
  // }, "-=.7")
  .from(".img img", {
    opacity: 0,
    duration: 0.7,
    scale: 1.2,
    stagger: 0.2
  })
  .from(".text h2", {
    opacity: 0,
    duration: 0.7,
    y: 50
  })
  .from(".text h5", {
    opacity: 0,
    duration: 0.7,
    y: 50
  }, "-=.5")
  .to(".content", {
    y: "75px",
    duration: 0.4
  })
  .to(".display", {
    y: "75px",
    duration: 0.4
  })


  if (currentUser) {
    loadFromLocalStorage();
    await fetchUserData();
  } else {
    loading.value = false;
  }
});
</script>

<style scoped>
template {
  font-family: "Montserrat", sans-serif;
  font-weight: bold;
  overflow-x: hidden;
}

.content {
  padding: 20px;
  text-align: center;
  color: white;
  background-color: white;
}

.display {
  display: flex;
  position: relative;
}

.display img {
  width: 100%;
  height: 700px;
  object-fit: cover;
  transition: height 0.3s ease;
}

.common {
  width: 100%;
  height: 700px;
  object-fit: cover;
  position: relative;
  transition: height 0.3s ease;
}

.img {
  position: relative;
  overflow: hidden;
}

.img-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  z-index: 1;
}

.text {
  position: absolute;
  bottom: 10%;
  left: 0%;
  width: 100%;
  color: #fff;
  text-align: center;
  text-transform: uppercase;
}

.text h2 {
  font-size: 4vw;  /* Make it responsive to the viewport width */
}

.text h5 {
  font-size: 2vw;  /* Responsive to viewport width */
}

.btn {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translateX(-50%);
}

.btn a {
  display: inline-block;
  border: 1px solid white;
  padding: 1.5vw 3vw; /* Responsive padding */
  color: #fff;
  text-transform: uppercase;
  text-decoration: none;
  opacity: 0;
  transition: all ease 0.5s;
}

.btn a:hover {
  background-color: #fff;
  color: #000;
}

.common:hover .btn a {
  opacity: 1;
}

/* Media queries for more control */
@media (max-width: 1200px) {
  /* You can enable font scaling if desired for smoother typography */
  /* .text h2 {
    font-size: 3.5vw;
  }
  .text h5 {
    font-size: 1.8vw;
  }
  .btn a {
    font-size: 1.8vw;
    padding: 1.4vw 2.5vw;
  } */
  
  .display img {
    height: 50vw; /* Adjusted for smoother scaling */
  }

  .common {
    height: 50vw;
  }
}

@media (max-width: 768px) {
  /* Enable font scaling as needed */
  /* .text h2 {
    font-size: 3vw;
  }
  .text h5 {
    font-size: 1.6vw;
  }
  .btn a {
    font-size: 1.6vw;
    padding: 1.2vw 2.2vw;
  } */
  
  .display img {
    height: 60vw;
  }

  .common {
    height: 60vw;
  }
}

@media (max-width: 480px) {
  /* Enable font scaling as needed */
  /* .text h2 {
    font-size: 2.5vw;
  }
  .text h5 {
    font-size: 1.4vw;
  }
  .btn a {
    font-size: 1.4vw;
    padding: 1vw 2vw;
  } */
  
  .display img {
    height: 80vw;
  }

  .common {
    height: 80vw;
  }
}</style>