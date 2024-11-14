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
const userId = ref('');
const userName = ref('');
const itemName = ref('');
const sellerId = ref('');
const sellerName = ref('');

const handleVoucher = async () => {
  if (voucherId) {
    try {
      // Reference the voucher document in the 'prizes' collection
      const voucherDocRef = doc(db, 'prizes', voucherId);

      // Delete the voucher document
      await deleteDoc(voucherDocRef);
      console.log(`Voucher with ID ${voucherId} deleted successfully.`);

      // Reference the user document
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userSnapshot = await getDoc(userDocRef);

      // Check if user document exists
      if (userSnapshot.exists()) {
        // Remove the voucherId from the user's vouchers array
        await updateDoc(userDocRef, {
          orderHistory: arrayUnion(itemId),
          vouchers: arrayRemove(voucherId)
        });
        const data = userSnapshot.data();
        userId.value = data.id;
        userName.value = data.username;
        
        console.log(`Voucher ID ${voucherId} removed from user's vouchers array.`);
      } else {
        console.log("User document does not exist.");
      }
    } catch (error) {
      console.error('Error handling voucher deletion:', error);
    }
  }
};

const deleteItem = async () => {
  try {
    // Reference the item document in the respective collection
    const itemDocRef = doc(db, category, itemId);
    const itemSnapshot = await getDoc(itemDocRef);
    if (itemSnapshot.exists()) {
      const data = itemSnapshot.data();
      itemName.value = data.itemName;
      sellerId.value = data.userId;
      sellerName.value = data.userName;

      // Delete the item document
      await deleteDoc(itemDocRef);
      console.log(`Item with ID ${itemId} deleted successfully.`);
    } else {
      console.log(`Item with ID ${itemId} does not exist.`);
    }
  } catch (error) {
    console.error('Error deleting item:', error);
  }
}

const updateSold = async () => {
  try{
    const soldItem = doc(db, 'Sold', itemId);
    await setDoc(soldItem, {
      itemName: itemName.value,
      userId: sellerId.value,
      userName: sellerName.value,
      buyerId: userId.value,
      buyerName: userName.value,
      itemId: itemId,
      // category: category,
      // timestamp: new Date().toISOString()
    });
  }catch (error){
    console.error('Error updating sold:', error);
  }
}

onMounted( async () => {
  console.log('Route params:', route.params);
  cartStore.clearCart();
  await handleVoucher();
  await deleteItem();
  updateSold; // Call handleVoucher on mount to delete the voucher if voucherId exists
});
</script>


<style scoped>
.success-container {
  padding: 40px;
  margin-top: 40px;
}
</style>
