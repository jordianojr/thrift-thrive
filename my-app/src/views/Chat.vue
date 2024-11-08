<template>
  <div class="chat-container">
    <div class="container-fluid vh-100">
      <div class="row h-100 chat-wrapper">
        <!-- Left Column - Inbox -->
        <div class="col-md-4 col-lg-3 border-end border-secondary p-0">
          <div class="d-flex align-items-center p-3 border-bottom border-secondary">
            <h5 class="mb-0 text-black">Inbox</h5>
            <span class="text-secondary ms-2">({{ unreadCount }} unread)</span>
          </div>
          
          <div class="chat-list">
            <div v-for="chat in chatsWithSellerInfo" :key="chat.id" 
                @click="selectChat(chat)"
                :class="['chat-item p-3 border-bottom border-secondary', 
                          selectedChatId === chat.id ? 'selected' : '']">
              <div class="d-flex">
                <img :src="chat.sellerAvatar" :alt="chat.sellerName" 
                    class="rounded-circle" style="width: 48px; height: 48px;">
                <div class="ms-3 flex-grow-1">
                  <div class="d-flex justify-content-between">
                    <h6 class="mb-1" style="color:black !important">{{ chat.sellerName }}</h6>
                    <small class="text-secondary">{{ formatDate(chat.lastMessageTime) }}</small>
                  </div>
                  <p class="mb-1 text-truncate text-black-50" style="width: 100%">{{ chat.lastMessage }}</p>
                  <div class="d-flex align-items-center">
                    <img :src="chat.itemImage" :alt="chat.itemName" 
                        class="rounded" style="width: 40px; height: 40px; object-fit: cover;">
                    <span class="ms-2 text-secondary small">{{ chat.itemName }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Chat -->
        <div class="col-md-8 col-lg-9 p-0 d-flex flex-column">
          <!-- Chat Header -->
          <div class="p-3 border-bottom border-secondary chat-header">
            <div class="d-flex align-items-center">
              <img v-if="selectedChatId" :src="selectedChat?.sellerAvatar" alt="" 
                  class="rounded-circle" style="width: 40px; height: 40px;">
              <div class="ms-3">
                <h6 class="mb-0 text-black">{{ selectedChat?.sellerName || 'Select a chat' }}</h6>
                <small class="text-secondary">{{ selectedChat?.itemName }}</small>
              </div>
            </div>
          </div>

          <!-- Chat Messages -->
          <div class="flex-grow-1 overflow-auto chat-messages" ref="messageContainer">
            <div v-if="messages.length === 0" class="text-center text-secondary my-5">
              No messages yet. Start the conversation!
            </div>
            <div v-for="message in messages" :key="message.id" 
                :class="['message mb-3 d-flex', 
                          message.senderId === userId ? 'justify-content-end' : 'justify-content-start']">
              <div :class="['message-content p-3 rounded', 
                          message.senderId === userId ? 'bg-primary' : 'bg-secondary']"
                  style="max-width: 70%;">
                <p class="mb-1 text-white">{{ message.content }}</p>
                <small class="text-white-50">{{ formatDate(message.timestamp) }}</small>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="p-3 border-top border-secondary chat-input">
            <div class="input-group">
              <input type="text" class="form-control text-black border-secondary" 
                    v-model="newMessage" 
                    @keyup.enter="sendMessage"
                    placeholder="Type a message...">
              <button class="btn btn-primary" @click="sendMessage" 
                      :disabled="!newMessage.trim()">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { db, auth } from '@/lib/firebaseConfig';
import { 
  collection, query, where, orderBy, onSnapshot,
  addDoc, serverTimestamp, doc, setDoc, updateDoc, getDoc
} from 'firebase/firestore';

const route = useRoute();
const sellerId = route.params.sellerId as string;
const itemId = route.params.itemId as string;
const category = route.params.category as string;
const userId = auth.currentUser?.uid;

const chats = ref<any[]>([]);
const sellerInfo = ref<Map<string, any>>(new Map());
const messages = ref<any[]>([]);
const selectedChatId = ref<string | null>(null);
const selectedChat = ref<any>({});
const newMessage = ref('');
const unreadCount = ref(0);
const messageContainer = ref<HTMLElement | null>(null);

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
    selectChat({ id: chatId });
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

async function sendMessage() {
  if (!newMessage.value.trim() || !selectedChatId.value) return;

  const messageData = {
    content: newMessage.value,
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
  min-height: 100vh;
  max-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-wrapper {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
  height: calc(100vh - 32px);
  overflow: hidden;
}

.chat-list {
  height: calc(100vh - 76px);
  overflow-y: auto;
  background-color: white;
}

.chat-messages {
  padding: 1rem;
  overflow-y: auto;
  flex-grow: 1;
}

.chat-header {
  border-bottom: 1px solid #ddd;
  flex-shrink: 0;
}

.chat-input {
  border-top: 1px solid #ddd;
  flex-shrink: 0;
}

.chat-item {
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-item:hover,
.chat-item.selected {
  background-color: rgb(66, 232, 66);
}

.message-content {
  word-break: break-word;
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

/* Updated responsive styles */
@media (max-width: 768px) {
  .chat-container {
    padding: 0;
  }

  .chat-wrapper {
    border-radius: 0;
    height: 100vh;
  }

  .col-md-4 {
    height: 40vh;
    border-bottom: 1px solid #333;
  }
  
  .col-md-8 {
    height: 60vh;
  }
}
</style>