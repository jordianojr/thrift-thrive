<template>
  <div class="success-container text-center">
    <h2 class="text-black mb-4">Payment Successful!</h2>
    <p class="text-black mb-4">Thank you for your purchase.</p>
    <router-link to="/marketplace" class="btn btn-success">
      Continue Shopping 
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useCartStore } from '@/stores/cartStore';
import { useRoute } from 'vue-router';
import { doc, deleteDoc, updateDoc, arrayRemove, getDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebaseConfig';

const route = useRoute();
const voucherId = route.params.voucherId as string | undefined;
const itemId = route.params.itemId as string;
const category = route.params.category as string;
const cartStore = useCartStore();

// Refs for storing data
const userId = ref('');
const userName = ref('');
const itemName = ref('');
const sellerId = ref('');
const sellerName = ref('');
const isProcessing = ref(false);
const spinCount = ref(0);

// Handle voucher deletion and user update
const handleVoucher = async () => {
  if (!voucherId || !auth.currentUser) return;

  try {
    const voucherDocRef = doc(db, 'prizes', voucherId);
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    
    // Get user data first
    const userSnapshot = await getDoc(userDocRef);
    if (!userSnapshot.exists()) {
      console.error("User document does not exist.");
      return;
    }

    // Store user data
    const userData = userSnapshot.data();
    userId.value = userData.id || auth.currentUser.uid;
    userName.value = userData.username;
    spinCount.value = userData.spinChance;
    // Delete voucher and update user document
    await Promise.all([
      deleteDoc(voucherDocRef),
      updateDoc(userDocRef, {
        orderHistory: arrayUnion(itemId),
        vouchers: arrayRemove(voucherId),
        spinChance: spinCount.value + 1
      })
    ]);

    console.log(`Voucher ${voucherId} processed successfully`);
  } catch (error) {
    console.error('Error handling voucher:', error);
    throw error; // Rethrow to be caught by the main handler
  }
};

// Delete item from its category
const deleteItem = async () => {
  if (!itemId || !category) return;

  try {
    const itemDocRef = doc(db, category, itemId);
    const itemSnapshot = await getDoc(itemDocRef);
    
    if (!itemSnapshot.exists()) {
      console.error(`Item ${itemId} does not exist in category ${category}`);
      return;
    }

    // Store item data before deletion
    const itemData = itemSnapshot.data();
    itemName.value = itemData.itemName;
    sellerId.value = itemData.userId;
    sellerName.value = itemData.userName;

    const sellerDocRef = doc(db, 'users', sellerId.value);
    updateDoc(sellerDocRef, {
        salesHistory: arrayUnion(itemId),
      })
    
    // Delete the item
    await deleteDoc(itemDocRef);
    console.log(`Item ${itemId} deleted successfully`);
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

// Update sold items collection
const updateSold = async () => {
  if (!itemId || !itemName.value || !sellerId.value || !sellerName.value) {
    console.error('Missing required data for updating sold items');
    return;
  }

  try {
    const soldItem = doc(db, 'Sold', itemId);
    await setDoc(soldItem, {
      itemName: itemName.value,
      sellerUserId: sellerId.value,
      sellerUserName: sellerName.value,
      buyerUserId: userId.value,
      buyerUserName: userName.value,
      id: itemId,
      category: category,
      timestamp: new Date().toISOString()
    });
    
    console.log(`Item ${itemId} marked as sold successfully`);
  } catch (error) {
    console.error('Error updating sold items:', error);
    throw error;
  }
};

// Main process handler
const processCheckout = async () => {
  isProcessing.value = true;
  
  try {
    cartStore.clearCart();
    
    // Execute all operations in sequence
    if (voucherId) {
      await handleVoucher();
    }
    await deleteItem();
    await updateSold();
    
    console.log('Checkout process completed successfully');
  } catch (error) {
    console.error('Checkout process failed:', error);
    // Here you might want to add error handling UI feedback
  } finally {
    isProcessing.value = false;
  }
};

onMounted(() => {
  console.log('Processing checkout for:', { itemId, category, voucherId });
  processCheckout();
});
</script>


<style scoped>
.success-container {
  padding: 40px;
  margin-top: 40px;
}
</style>
