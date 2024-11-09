<script setup>
import { onMounted, onUnmounted } from 'vue'
import { db } from '@/lib/firebaseConfig'
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore'

const emit = defineEmits(['prizeWon'])
let gameInstance = null
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
