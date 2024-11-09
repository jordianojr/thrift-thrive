<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue'
import { auth, db } from '@/lib/firebaseConfig'
import { serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore'
import router from '@/router';

const emit = defineEmits(['prizeWon'])
let gameInstance: { destroy: (arg0: boolean) => void; } | null = null
const containerId = 'game-container'

// Save prize to Firebase
const savePrizeToFirebase = async (prizeData) => {
  console.log(prizeData);
  try {
    // Check if `prizeData.id` is defined and is a valid string
    if (!prizeData.code || typeof prizeData.code !== 'string') {
      throw new Error('Invalid or missing prizeData.id');
    }

    const docRef = doc(db, 'prizes', prizeData.code);  // Use prizeData.id as document ID
    await setDoc(docRef, {
      ...prizeData,
      timestamp: serverTimestamp(),
      used: false
    });

    console.log('Prize saved with ID:', prizeData.code);
    emit('prizeWon', { ...prizeData, id: prizeData.code });

    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const userSnapshot = await getDoc(userDocRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const updatedVouchers = [...userData.vouchers, prizeData.code];
      const updatedSpins = userData.spinChance - 1;

      await setDoc(userDocRef, { vouchers: updatedVouchers, spinChance: updatedSpins }, { merge: true });
      if (updatedSpins <= 0) {
        alert('No more spins left');
        router.push({ name: 'home' });
      }
    }
  } catch (error) {
    console.error('Error saving prize:', error);
  }
};


// Import game and pass the Firebase callback
const game = await import(/* webpackChunkName: "game" */ '@/components/game')

onMounted(() => {
  // Pass the Firebase callback to the game
  gameInstance = game.launch(containerId, { onPrizeWon: savePrizeToFirebase })
})

onUnmounted(() => {
  gameInstance.destroy(false)
})
</script>

<template>
  <div :id="containerId" />
</template>
