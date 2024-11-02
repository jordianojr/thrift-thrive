<template>
  <div>
    <button
      class="floating-bot"
      type="button"
      data-bs-toggle="offcanvas"
      data-bs-target="#fashionBotOffcanvas"
      aria-controls="fashionBotOffcanvas"
      :class="{ bouncing: isBouncing }" 
    >
      <span class="bot-emoji">🤖👗</span>
    </button>

    <div
      class="offcanvas offcanvas-start"
      data-bs-backdrop="false"
      tabindex="-1"
      id="fashionBotOffcanvas"
      aria-labelledby="fashionBotOffcanvasLabel"
    >
      <!-- Header -->
      <div class="offcanvas-header">
        <div class="header-content">
          <h5 class="offcanvas-title" id="fashionBotOffcanvasLabel">🤖👗 StyleBot</h5>
        </div>
        <button type="button" class="close-button" data-bs-dismiss="offcanvas" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <!-- Messages Body -->
      <div class="offcanvas-body">
        <div class="fashion-bot">
          <div class="messages-wrapper" ref="messageContainer">
            <div 
              v-for="(message, index) in messages" 
              :key="index"
              :class="['message', message.from === 'bot' ? 'bot-message' : 'user-message']"
            >
              <img 
                v-if="message.image" 
                :src="message.image" 
                alt="Uploaded fashion image"
                class="message-image"
                @click="openImageModal(message.image)"
              />
              <p style="color: black">{{ message.text }}</p>
            </div>
            <!-- Typing indicator -->
            <div v-if="isTyping" class="bot-message typing-indicator">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          <div id="bottom"></div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="input-container">
        <div v-if="previewImage" class="image-preview">
          <img :src="previewImage" alt="Preview" />
          <button @click="clearImage" class="clear-image-btn">
            <span>&times;</span>
          </button>
        </div>
        <div class="input-wrapper row">
          <div class="col-8 type">
            <input 
            v-model="userInput" 
            @keydown.enter="sendMessage" 
            placeholder="Ask about fashion advice..." 
            class="message-input"
          />
          </div>
          <div class="col-2 send">
            <button @click="sendMessage" class="send-button" style="margin-left: 5px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
          </div>
          <div class="col-2 upload">
            <label class="upload-button">
            <input 
              type="file" 
              @change="handleImageUpload" 
              accept="image/*"
              class="hidden-input"
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Modal -->
    <div v-if="modalImage" class="image-modal" @click="closeImageModal">
      <img :src="modalImage" alt="Enlarged fashion image" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { openai } from '../lib/openAi'; // Ensure you have the OpenAI package
import { storage } from "../lib/firebaseConfig"; // Adjust path as needed
import { ref as storageRef, uploadString, getDownloadURL } from "firebase/storage";

const userInput = ref('');
const messages = ref<any[]>([]);
const isBouncing = ref(false);
const isTyping = ref(false);
const messageContainer = ref<HTMLElement | null>(null);
const previewImage = ref('');
const modalImage = ref('');
const currentImage = ref<File | null>(null);

const scrollToBottom = () => {
      const bottomAnchor = document.getElementById('bottom');
      if (bottomAnchor) {
        bottomAnchor.scrollIntoView({ behavior: 'smooth' });
      }
    };
// Load messages from localStorage
const loadMessages = () => {
  const storedMessages = localStorage.getItem('messages');
  if (storedMessages) {
    messages.value = JSON.parse(storedMessages);
    scrollToBottom();
  }
};

// Save messages to localStorage
const saveMessages = () => {
  localStorage.setItem('messages', JSON.stringify(messages.value));
};

watch(messages, () => {
  scrollToBottom();
});

const startBouncing = () => {
  isBouncing.value = true;
  setTimeout(() => {
    isBouncing.value = false;
  }, 1000); // Duration of the animation
};

const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    currentImage.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const clearImage = () => {
  previewImage.value = '';
  currentImage.value = null;
};

const openImageModal = (imageSrc: string) => {
  modalImage.value = imageSrc;
};

const closeImageModal = () => {
  modalImage.value = '';
};

const sendMessage = async () => {
  // Check if there's input or an image to send
  if (userInput.value.trim() === '' && !previewImage.value) return;

  // Construct the user's message content
  const messageContent = {
    from: 'user',
    text: userInput.value.trim(),
    image: previewImage.value || null,
  };

  // Push the user's message to the messages array and reset input
  messages.value.push(messageContent);
  saveMessages();
  await nextTick(); // Wait for the DOM to update
  scrollToBottom();

  userInput.value = ""; // Clear text input

  isTyping.value = true;

  try {
    let response;

    // If there's an image, upload it first
    if (previewImage.value) {
      const base64Image = previewImage.value.split(',')[1];
      const imageRef = storageRef(storage, `stylebot_uploads/${Date.now()}.jpg`);
      await uploadString(imageRef, base64Image, 'base64');

      const imageUrl = await getDownloadURL(imageRef);
      clearImage(); // Clear preview image after processing

      const promptMessages = messages.value.map(message => ({
        role: message.from === 'user' ? 'user' : 'assistant',
        content: message.text,
      }));

      // Create a request including the image URL and the desired output format
      response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: "You are a fashion expert bot. Analyze the uploaded image and provide detailed fashion advice, style suggestions, and outfit recommendations in this format:\n\nThis is a [description of the outfit].\n\n### Outfit Inspiration:\n#### For a Casual Look:\n- **Top**: [suggestions]\n- **Bottom**: [suggestions]\n- **Accessories**: [suggestions]\n\n#### For a Sporty Outfit:\n- **Top**: [suggestions]\n- **Bottom**: [suggestions]\n- **Accessories**: [suggestions]\n\n#### For a Fashion-Forward Edge:\n- **Top**: [suggestions]\n- **Bottom**: [suggestions]\n- **Accessories**: [suggestions]",
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: messageContent.text || "What is this clothing item? Please suggest some outfits for me" },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
          ...promptMessages,
        ],
        max_tokens: 500,
      });
    } else {
      // Handle text-only messages
      const promptMessages = messages.value.map(message => ({
        role: message.from === 'user' ? 'user' : 'assistant',
        content: message.text,
      }));

      response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: "You are a fashion bot. Provide tailored fashion advice based on user input in this format:\n\nThe image shows [description of the outfit].\n\n### Outfit Inspiration:\n#### For a Casual Look:\n- **Top**: [suggestions]\n- **Bottom**: [suggestions]\n- **Accessories**: [suggestions]\n\n#### For a Sporty Outfit:\n- **Top**: [suggestions]\n- **Bottom**: [suggestions]\n- **Accessories**: [suggestions]\n\n#### For a Fashion-Forward Edge:\n- **Top**: [suggestions]\n- **Bottom**: [suggestions]\n- **Accessories**: [suggestions]",
          },
          ...promptMessages,
        ],
      });
    }

    // Check if the response has choices and content
    if (response.choices && response.choices.length > 0) {
      const botMessage = { from: 'bot', text: response.choices[0].message.content };
      messages.value.push(botMessage);
    } else {
      throw new Error("No response from the model");
    }

    saveMessages();
    await nextTick(); // Wait for the DOM to update
    scrollToBottom();
  } catch (error) {
    // Error handling if API call fails
    console.error('Error:', error);
    isTyping.value = false;
    messages.value.push({ from: 'bot', text: 'Sorry, I encountered an error. Please try again.' });
    saveMessages();
  } finally {
    isTyping.value = false; // Ensure typing indicator is reset in any case
  }
};

onMounted(() => {
  loadMessages();
  // Start bouncing every 10 seconds
  setInterval(startBouncing, 5000);
});
</script>

<style scoped>
.fashion-bot {
  max-height: 300px; /* Limit height to fit in the offcanvas */
  padding: 10px;
}

.messages {
  max-height: 200px; /* Limit height for messages */
  overflow-y: auto;
  margin-bottom: 10px;
}

.bot-message {
  background-color: lightgrey;
  border-radius: 10px;
  padding: 10px;
  margin: 5px 0;
  max-width: 80%;
  border: 1px solid #ccc;
}

.user-message {
  background-color: #007bff;
  color: white;
  border-radius: 10px;
  padding: 10px;
  margin: 5px 0px;
  margin-left: auto;
  max-width: 80%;
  border: 1px solid #ccc;
}

.input-group {
  display: flex;
  align-items: center;
  padding: 10px; /* Add padding around input group */
  background-color: lightgrey; /* Ensure the input group stands out */
  border-top: 1px solid black; /* Optional: border on top for separation */
  border-radius: 5px;
}

input {
  flex-grow: 1; /* Allow input to grow */
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px;
  margin-left: 15px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

/* Floating bot styles */
.floating-bot {
  position: fixed; /* Fixed position to float over the content */
  bottom: 5%; /* Distance from the bottom as a percentage of the viewport height */
  right: 5%; /* Distance from the right as a percentage of the viewport width */
  width: 30%; /* Width relative to viewport width */
  max-width: 60px; /* Maximum width to ensure it doesn't get too large */
  height: auto; /* Auto height to maintain aspect ratio */
  aspect-ratio: 1; /* Ensure it stays circular */
  background-color: black; /* Change as needed */
  color: white;
  border-radius: 50%; /* Makes it circular */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Shadow for depth */
  transition: background-color 0.3s; /* Smooth transition */
}

.floating-bot:hover {
  background-color: white; /* Darker green on hover */
  border: 1px solid grey; /* Add border on hover */
}

.offcanvas {
  background-color: white;
  border-radius: 10px;
  border: 1px solid black;
}

.offcanvas-header {
  display: flex;
  justify-content: space-between; /* Space between title and button */
  align-items: center; /* Center vertically */
  padding: 10px; /* Add some padding for aesthetics */
  background-color: white; 
  border-bottom: 1px solid #ccc; 
}

.offcanvas-body {
  margin-top: 5px;
  margin-bottom: 5px;
  background-color: white;
  padding-top: 5px;
}

/* Bounce animation styles */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-15px); /* Change the height of the bounce */
  }
  60% {
    transform: translateY(-10px); /* Change the height of the bounce */
  }
}

.bouncing {
  animation: bounce 1s infinite; /* Animation lasts 1 second and repeats infinitely */
}
.hidden-input {
  display: none;
}

.upload-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: #f0f0f0;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.upload-button:hover {
  background: #e0e0e0;
}

.image-preview {
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: #f8f9fa;
  position: relative;
  margin-bottom: 0.5rem;
}

.image-preview img {
  max-height: 100px;
  border-radius: 0.25rem;
  display: block;
}

.clear-image-btn {
  position: absolute;
  top: 0;
  right: 13px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transform: translate(50%, -50%);
}

.message-image {
  max-width: 200px;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.message-image:hover {
  transform: scale(1.05);
}

.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.image-modal img {
  max-width: 90%;
  max-height: 90vh;
  border-radius: 0.5rem;
}
.typing-indicator {
  display: flex;
  align-items: center;
}

.dot {
  height: 8px;
  width: 8px;
  margin: 0 2px;
  border-radius: 50%;
  background-color: gray;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.message-input{
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.type{
  padding-right: 0px;
}

.send{
  padding-left: 0px;
}
.upload{
  padding-left: 0px;
}
.close-button{
  background-color: white !important;
  color: black !important;
  border: none;
  font-size: larger !important;
  font-weight: 500;
}
.messages-wrapper {
  max-height: 100%; /* or your desired height */
  overflow-y: auto;  /* Enable scrolling */
  scroll-behavior: smooth;
}

</style>
