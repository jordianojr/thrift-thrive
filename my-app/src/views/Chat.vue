<template>
  <!-- for alerts popping in and out-->
  <CustomAlert :visible="showAlert" :message="alertMessage" :alert-type="alertType" :timeout="3000"
    @update:visible="showAlert = $event" />

  <div class="chat-container">
    <div class="container-fluid h-100">
      <div class="row h-100 chat-wrapper">
        <!-- Left Column - Inbox (unchanged) -->
        <div :class="['col-md-4 col-lg-3 p-0 border-end border-secondary', { 'hidden': isMobileAndChatSelected }]">
          <div class="d-flex align-items-center p-3 border-bottom border-secondary topbar">
            <h5 class="chat-header m-0">Inbox</h5>
            <!-- <span class="chat-header text-secondary ms-2">({{ unreadCount }} unread)</span> -->
          </div>

          <div class="chat-list">
            <div v-for="chat in chatsWithSellerInfo" :key="chat.id" @click="selectChat(chat)" :class="['chat-item p-3 border-bottom border-secondary',
              selectedChatId === chat.id ? 'chat-item-selected' : '']">
              <div class="d-flex">
                <img :src="chat.sellerAvatar" :alt="chat.sellerName" class="rounded-circle"
                  style="width: 48px; height: 48px; object-fit: cover;">
                <div class="ms-3 flex-grow-1">
                  <div class="d-flex justify-content-between">
                    <h6 class="mb-1 text-black">{{ chat.sellerName }}</h6>
                    <small class="text-secondary">{{ formatDate(chat.lastMessageTime) }}</small>
                  </div>
                  <p class="mb-1 text-truncate text-black-50" style="width: 100%">{{ chat.lastMessage }}</p>
                  <div class="d-flex align-items-center">
                    <img :src="chat.itemImage" :alt="chat.itemName" class="rounded"
                      style="width: 40px; height: 40px; object-fit: cover;">
                    <span class="ms-2 text-secondary small">{{ chat.itemName }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Chat -->
        <div class="col-md-8 col-lg-9 p-0 d-flex flex-column">
          <!-- Chat Header (unchanged) -->
          <div class="p-3 border-bottom border-secondary chat-header topbar">
            <div class="d-flex align-items-center">
              <button class="btn mobile-back-button d-md-none" @click="backToInbox">
                <i class="bi bi-chevron-left fs-4"></i>
              </button>
              <img v-if="selectedChatId" :src="selectedChat?.sellerAvatar" alt=""
                class="rounded-circle chat-header-avatar">
              <div class="ms-3 chat-header-info">
                <h5 class="mb-0 text-black seller-name">{{ selectedChat?.sellerName || 'Select a chat' }}</h5>
                <small class="text-secondary product-name">{{ selectedChat?.itemName || '' }} </small>
              </div>
            </div>
          </div>

          <!-- Chat Messages -->
          <div class="flex-grow-1 overflow-auto chat-messages" ref="messageContainer">
            <div v-if="messages.length === 0" class="text-center chat-header text-secondary my-5">
              No messages yet. Start the conversation!
            </div>
            <div v-for="message in messages" :key="message.id" :class="['message mb-3',
              message.senderId === userId ? 'justify-content-end' : 'justify-content-start']">
              <div :class="['message-content p-3 rounded',
                message.senderId === userId ? 'bg-58ea5d text-white' : 'bg-f8f8f8']">
                <!-- Text message -->
                <p v-if="message.type === 'text'" class="mb-1">{{ message.content }}</p>
                <!-- Image message -->
                <img v-else-if="message.type === 'image'" :src="message.content" alt="Sent image"
                  class="img-fluid rounded mb-1" style="max-width: 300px; cursor: pointer"
                  @click="openImageModal(message.content)">
                <div class="row">
                  <small style="float: inline-end;" class="text-secondary">{{ formatDate(message.timestamp) }}</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="border-top border-secondary chat-input">
            <div class="input-group">
              <input style="border-radius: 0px; font-family: 'Helvetica Neue', sans-serif; font-weight: 400;"
                type="text" class="py-3 form-control text-black" v-model="newMessage" @keyup.enter="sendMessage"
                placeholder="Type a message...">
              <!-- Image upload button -->
              <button class="btn" @click="triggerFileInput">
                <i class="bi bi-image"></i>
              </button>
              <input type="file" ref="fileInput" accept="image/*" class="d-none" @change="handleImageUpload">
              <button style="border-radius: 0px; border-left:1px solid black;" class="btn send-button"
                @click="sendMessage">
                <span class="bi bi-send px-5"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="showImageModal" class="modal fade show" style="display: block; background-color: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="btn-close" @click="closeImageModal"></button>
          </div>
          <div class="modal-body">
            <img :src="selectedImage" class="img-fluid" alt="Full size image">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { db, auth, storage } from '@/lib/firebaseConfig';
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, serverTimestamp, doc, setDoc, updateDoc, getDoc
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
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
const sellerId = route.params.sellerId as string;
const itemId = route.params.itemId as string;
const category = route.params.category as string;

const fileInput = ref<HTMLInputElement | null>(null);
const showImageModal = ref(false);
const selectedImage = ref('');

const chats = ref<any[]>([]);
const sellerInfo = ref<Map<string, any>>(new Map());
const messages = ref<any[]>([]);
const selectedChatId = ref<string | null>(null);
const selectedChat = ref<any>({});
const newMessage = ref('');
const unreadCount = ref(0);
const messageContainer = ref<HTMLElement | null>(null);

const isMobile = ref(window.innerWidth <= 768);
const isMobileAndChatSelected = computed(() =>
  isMobile.value && selectedChatId.value !== null
);

const getUserUID = () => {
    const cachedData = localStorage.getItem(`user`);
    if (cachedData) {
    const userData = JSON.parse(cachedData);
    return userData.uid;
    } else {
    return auth.currentUser.uid;
    }
};

const userId = getUserUID();

// Image modal functions
function openImageModal(imageUrl: string) {
  selectedImage.value = imageUrl;
  showImageModal.value = true;
}

function closeImageModal() {
  showImageModal.value = false;
  selectedImage.value = '';
}

// Trigger file input click
function triggerFileInput() {
  if (fileInput.value) {
    fileInput.value.click();
  }
}

// Handle image upload
async function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) return;

  const file = target.files[0];
  const maxSize = 5 * 1024 * 1024; // 5MB limit

  if (file.size > maxSize) {
    //alert('Image size should be less than 5MB');
    showCustomAlert('Image size should be less than 5MB', 'error');
    return;
  }

  try {
    const imageRef = storageRef(storage, `chat-images/${selectedChatId.value}/${Date.now()}_${file.name}`);
    await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(imageRef);
    await sendImageMessage(downloadURL);
  } catch (error) {
    console.error('Error uploading image:', error);
    //alert('Failed to upload image. Please try again.');
    showCustomAlert('Failed to upload image. Please try again.', 'error');
  }
}

// Send image message
async function sendImageMessage(imageUrl: string) {
  if (!selectedChatId.value) return;

  const messageData = {
    content: imageUrl,
    type: 'image',
    senderId: userId,
    timestamp: serverTimestamp()
  };

  try {
    await addDoc(collection(db, `Chats/${selectedChatId.value}/messages`), messageData);

    await updateDoc(doc(db, 'Chats', selectedChatId.value), {
      lastMessage: '📷 Image',
      lastMessageTime: serverTimestamp(),
      lastMessageSenderId: userId,
    });

    scrollToBottom();
  } catch (error) {
    console.error('Error sending image message:', error);
  }
}

// Modified sendMessage function to include message type
async function sendMessage() {
  if (!newMessage.value.trim() || !selectedChatId.value) return;

  const messageData = {
    content: newMessage.value,
    type: 'text',
    senderId: userId,
    timestamp: serverTimestamp()
  };

  try {
    await addDoc(collection(db, `Chats/${selectedChatId.value}/messages`), messageData);

    await updateDoc(doc(db, 'Chats', selectedChatId.value), {
      lastMessage: newMessage.value,
      lastMessageTime: serverTimestamp(),
      lastMessageSenderId: userId,
    });

    newMessage.value = '';
    scrollToBottom();
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

function backToInbox() {
  if (isMobile.value) {
    selectedChatId.value = null;
    selectedChat.value = {};
    messages.value = [];
  }
}
onMounted(() => {
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 768;
  });
});

// Computed property to combine chats with seller info
const chatsWithSellerInfo = computed(() => {
  return chats.value.map(chat => {
    const sellerId = chat.participants.find((id: string) => id !== userId);
    const seller = sellerInfo.value.get(sellerId) || {};
    return {
      ...chat,
      sellerName: seller.username || 'Unknown Seller',
      sellerAvatar: seller.photoURL || 'https://via.placeholder.com/48',
    };
  });
});

// Function to fetch seller information
async function fetchSellerInfo(sellerId: string) {
  if (sellerInfo.value.has(sellerId)) return;

  try {
    const sellerDoc = await getDoc(doc(db, 'users', sellerId));
    if (sellerDoc.exists()) {
      sellerInfo.value.set(sellerId, sellerDoc.data());
    } else {
      console.warn(`Seller ${sellerId} not found`);
      sellerInfo.value.set(sellerId, {
        username: 'Unknown Seller',
        photoURL: 'https://via.placeholder.com/48'
      });
    }
  } catch (error) {
    console.error('Error fetching seller info:', error);
    sellerInfo.value.set(sellerId, {
      username: 'Unknown Seller',
      photoURL: 'https://via.placeholder.com/48'
    });
  }
}

// Initialize chat when component mounts
onMounted(async () => {
  const chatsQuery = query(
    collection(db, 'Chats'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );

  onSnapshot(chatsQuery, async (snapshot) => {
    chats.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Fetch seller info for all chats
    const sellerIds = new Set(chats.value.map(chat =>
      chat.participants.find((id: string) => id !== userId)
    ));

    for (const sellerId of sellerIds) {
      await fetchSellerInfo(sellerId);
    }

    unreadCount.value = chats.value.filter(chat =>
      chat.unreadCount && chat.lastMessageSenderId !== userId
    ).length;
  });

  if (sellerId && itemId) {
    await fetchSellerInfo(sellerId);
    const chatId = await getOrCreateChat(sellerId, itemId);
    // selectChat({ id: chatId });
    router.push({ path: '/chat' });
  }
});

async function getOrCreateChat(sellerId: string, itemId: string) {
  const chatId = `${sellerId}_${itemId}_${userId}`;
  const chatDocRef = doc(db, 'Chats', chatId);

  const chatDoc = await getDoc(chatDocRef);
  if (chatDoc.exists()) {
    return chatDoc.id;
  }

  const itemDocRef = doc(db, category, itemId);
  const itemDoc = await getDoc(itemDocRef);
  const sellerDoc = await getDoc(doc(db, 'users', sellerId));

  if (!itemDoc.exists()) {
    throw new Error(`Item with ID ${itemId} not found`);
  }

  const itemData = itemDoc.data();
  const sellerData = sellerDoc.exists() ? sellerDoc.data() : null;

  await setDoc(chatDocRef, {
    participants: [userId, sellerId].sort(),
    itemId,
    itemName: itemData.itemName || 'Unknown Item',
    itemImage: itemData.itemPhotoURLs ? itemData.itemPhotoURLs[0] : '',
    sellerName: sellerData?.username || 'Unknown Seller',
    sellerAvatar: sellerData?.photoURL || 'https://via.placeholder.com/48',
    created: serverTimestamp(),
    lastMessageTime: serverTimestamp(),
    lastMessage: '',
  });

  return chatId;
}

// Rest of your existing functions remain the same
async function selectChat(chat: any) {
  selectedChatId.value = chat.id;
  selectedChat.value = chat;

  const messagesQuery = query(
    collection(db, `Chats/${chat.id}/messages`),
    orderBy('timestamp', 'asc')
  );

  onSnapshot(messagesQuery, (snapshot) => {
    messages.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    scrollToBottom();
  });
}

function formatDate(timestamp: any) {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('en-SG', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function scrollToBottom() {
  if (messageContainer.value) {
    setTimeout(() => {
      messageContainer.value!.scrollTop = messageContainer.value!.scrollHeight;
    }, 100);
  }
}

watch(messages, () => {
  scrollToBottom();
});
</script>

<style scoped>
.chat-container {
  background-color: #f5f5f5;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.topbar {
  height: 60px;
}

.chat-wrapper {
  background-color: white;
  height: 90%;
  display: flex;
  overflow: hidden;
}

.chat-list {
  height: calc(100%);
  overflow-y: auto;
  background-color: white;
}

.col-md-8 {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-messages {
  padding: 1rem;
  overflow-y: auto;
  flex-grow: 1;
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 400;
  text-align: left;
  font-size: 0.9rem;
  border-radius: 20px;
  height: auto;
  /* Changed to auto to flex properly */
}

.chat-header {
  flex-shrink: 0;
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 500;
  text-transform: uppercase;
  text-align: left;
  font-size: 0.875rem;
}

.chat-header-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.chat-header-info {
  min-width: 0;
  /* Important for text truncation to work */
  flex: 1;
}

.seller-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.product-name {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.chat-input {
  border-top: 1px solid #ddd;
  flex-shrink: 0;
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 400;
  border-radius: 0px;
  background: white;
  width: 100%;
  /* Changed to 100% */
  position: relative;
  /* Changed to relative */
}

.chat-item {
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 500;
  text-transform: uppercase;
  text-align: left;
  font-size: 0.8rem;
  height: 140px;
}

.chat-item-selected {
  background-color: rgba(48, 48, 48, 0.338);
}

.chat-item:hover,
.chat-item.chat-item-selected {
  background-color: rgba(48, 48, 48, 0.338);
}

.message {
  display: flex;

}

.message-content {
  word-break: break-word;
  max-width: 70%;
}

.bg-58ea5d {
  background-color: black;
}

.bg-f8f8f8 {
  background-color: #f8f8f8;
}

.send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-left: 1px solid black;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-button:hover {
  background: #f8f8f8;
  border: 1px solid black;
  background: black;
  color: white;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #121212;
}

::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 3px;
}

.mobile-back-button {
  display: none;
}

/* Updated responsive styles */
@media (max-width: 768px) {
  .chat-container {
    padding: 0;
    height: 100vh;
    align-items: flex-start;
  }

  .chat-wrapper {
    border-radius: 0;
    height: 100vh;
    flex-direction: column;
  }

  /* Left Column - Inbox */
  .col-md-4 {
    height: 100vh;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    background: white;
    transition: transform 0.3s ease;
  }

  .col-md-4.hidden {
    transform: translateX(-100%);
  }

  /* Right Column - Chat */
  .col-md-8 {
    height: 100vh;
    width: 100%;
  }

  .chat-input {
    position: fixed;
    bottom: 0;
    width: 100%;
    left: 0;
  }

  .chat-messages {
    height: calc(100vh - 140px);
    /* Subtract header and input heights */
    padding-bottom: 70px;
    /* Add padding to prevent messages from being hidden behind input */
  }

  .topbar {
    padding: 0.75rem !important;
  }

  .chat-header-info {
    max-width: calc(100% - 90px);
    /* Accounts for back button and avatar */
  }

  .chat-header-avatar {
    width: 32px;
    height: 32px;
  }

  .seller-name {
    font-size: 0.9rem;
  }

  .product-name {
    font-size: 0.8rem;
  }

  .mobile-back-button {
    display: block !important;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin-right: 0.5rem;
    padding: 0;
    border: none;
    background: transparent;
    top: 100px;
  }

  .mobile-back-button:hover {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 50%;
  }

  /* Ensure the icon is visible */
  .mobile-back-button i {
    color: #000;
    font-size: 1.5rem;
  }
}

/* Hide the back button on desktop */
.mobile-back-button {
  display: none;
}
</style>