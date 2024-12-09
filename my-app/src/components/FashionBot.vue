<template>
  <div>
    <button
      class="floating-bot d-flex text-align-center justify-content-center"
      type="button"
      data-bs-toggle="offcanvas"
      data-bs-target="#fashionBotOffcanvas"
      aria-controls="fashionBotOffcanvas"
      :class="{ bouncing: isBouncing }" 
    >
      <span class="bi bi-robot fs-4"></span>
    </button>

    <div
      class="offcanvas offcanvas-end"
      data-bs-backdrop="false"
      tabindex="-1"
      id="fashionBotOffcanvas"
      aria-labelledby="fashionBotOffcanvasLabel"
      @show.bs.offcanvas="handleOffcanvasShow"
      @hide.bs.offcanvas="handleOffcanvasHide"
    >
      <div style="border-bottom: 1px solid #e5e5e5;">
        <div class="header-content">
          <p style="opacity: 0;">ab</p>
          <h5 id="fashionBotOffcanvasLabel">STYLEBOT</h5>
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16" 
          type="button"      
          data-bs-toggle="offcanvas"
          data-bs-target="#fashionBotOffcanvas"
          aria-controls="fashionBotOffcanvas">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
          </svg>
        </div>
      </div>
      <!-- Rest of your template code remains same -->
      <!-- Messages Body -->
      <div>
        <div>
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
              <p v-if="message.from === 'bot'" v-html="message.text"></p>
              <p v-else>{{ message.text }}</p>
            </div>
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
          <button @click="clearImage" class="clear-image-btn">×</button>
        </div>
        <div class="input-wrapper">
          <input 
            v-model="userInput" 
            @keydown.enter="sendMessage" 
            placeholder="Ask about fashion, style, or outfits..." 
            class="message-input"
          />
          <div class="button-group">
            <label class="upload-button">
              <input 
                type="file" 
                @change="handleImageUpload" 
                accept="image/png, image/jpeg, image/gif, image/webp"
                class="hidden-input"
              />              
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"></path>
              </svg>
            </label>
            <button @click="sendMessage" class="send-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
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

interface Message {
  from: 'user' | 'bot';
  text: string;
  image?: string | null;
}

const userInput = ref('');
const messages = ref<any[]>([]);
const isBouncing = ref(false);
const isTyping = ref(false);
const messageContainer = ref<HTMLElement | null>(null);
const previewImage = ref('');
const modalImage = ref('');
const currentImage = ref<File | null>(null);
const isOffcanvasOpen = ref(false);

const handleOffcanvasShow = () => {
  isOffcanvasOpen.value = true;
};

const handleOffcanvasHide = () => {
  isOffcanvasOpen.value = false;
};

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

onMounted(() => {
  loadMessages();
  setInterval(startBouncing, 5000);
});

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
  if (userInput.value.trim() === '' && !previewImage.value) return;

  const messageContent: Message = {
    from: 'user',
    text: userInput.value.trim(),
    image: previewImage.value || null,
  };

  messages.value.push(messageContent);
  saveMessages();
  await nextTick();
  scrollToBottom();

  userInput.value = "";
  isTyping.value = true;

  await nextTick();
  scrollToBottom();

  try {
    let response;

    // Convert message history to OpenAI format, handling both text and image messages
    const promptMessages = messages.value.map(message => {
      if (message.from === 'bot') {
        return {
          role: 'assistant',
          content: message.text
        };
      } else {
        // For user messages, if there's an image, create a message with both text and image
        if (message.image) {
          return {
            role: 'user',
            content: [
              { type: 'text', text: message.text || "What is this clothing item? Please suggest some outfits for me" },
              {
                type: 'image_url',
                image_url: {
                  url: message.image,
                },
              },
            ],
          };
        } else {
          // For text-only messages
          return {
            role: 'user',
            content: message.text
          };
        }
      }
    });

    if (previewImage.value) {
      const base64Image = previewImage.value.split(',')[1];
      clearImage();
      const imageRef = storageRef(storage, `stylebot_uploads/${Date.now()}.jpg`);
      await uploadString(imageRef, base64Image, 'base64');

      const imageUrl = await getDownloadURL(imageRef);

      // Create new image message
      const currentImageMessage = {
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
      };

      response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `
            You are a fashion bot. Provide tailored fashion advice based on user input in this format:
            Compliment the user's choice of clothing and then provide outfit suggestions in this format:

            <p>Your image is likely a [description of the image]. Here are some suggestions for you:</p>
            <h4>Outfit Inspiration:</h4>
            <h6>For a Casual Look:</h6>
            <ul>
              <li><strong>Top:</strong> [suggestions]</li>
              <li><strong>Bottom:</strong> [suggestions]</li>
              <li><strong>Shoes:</strong> [suggestions]</li>
              <li><strong>Accessories:</strong> [suggestions]</li>
            </ul>

            <h6>For a Sporty Outfit:</h6>
            <ul>
              <li><strong>Top:</strong> [suggestions]</li>
              <li><strong>Bottom:</strong> [suggestions]</li>
              <li><strong>Shoes:</strong> [suggestions]</li>
              <li><strong>Accessories:</strong> [suggestions]</li>
            </ul>

            <h6>For a Fashion-Forward Edge:</h6>
            <ul>
              <li><strong>Top:</strong> [suggestions]</li>
              <li><strong>Bottom:</strong> [suggestions]</li>
              <li><strong>Shoes:</strong> [suggestions]</li>
              <li><strong>Accessories:</strong> [suggestions]</li>
            </ul>
          `,
          },
          ...promptMessages.slice(0, -1), // Include previous messages except the last one
          currentImageMessage, // Add the current image message
        ],
        max_tokens: 500,
      });
    } else {
      // Handle text-only messages
      response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `
            You are a fashion bot. Provide tailored fashion advice based on user input in this format:

            Compliment the user's choice of clothing and then provide outfit suggestions in this format:
            <h4>Outfit Inspiration:</h4>
            <h6>For a Casual Look:</h6>
            <ul>
              <li><strong>Top:</strong> [suggestions]</li>
              <li><strong>Bottom:</strong> [suggestions]</li>
              <li><strong>Shoes:</strong> [suggestions]</li>
              <li><strong>Accessories:</strong> [suggestions]</li>
            </ul>

            <h6>For a Sporty Outfit:</h6>
            <ul>
              <li><strong>Top:</strong> [suggestions]</li>
              <li><strong>Bottom:</strong> [suggestions]</li>
              <li><strong>Shoes:</strong> [suggestions]</li>
              <li><strong>Accessories:</strong> [suggestions]</li>
            </ul>

            <h6>For a Fashion-Forward Edge:</h6>
            <ul>
              <li><strong>Top:</strong> [suggestions]</li>
              <li><strong>Bottom:</strong> [suggestions]</li>
              <li><strong>Shoes:</strong> [suggestions]</li>
              <li><strong>Accessories:</strong> [suggestions]</li>
            </ul>
          `,
          },
          ...promptMessages
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

</script>

<style scoped>
.offcanvas {
  top: 75px !important;
  /* width: 33.33% !important; */
  height: calc(100vh - 75px) !important;
  border-radius: 0 !important;
  border-top: 1px solid black !important;
  border-left: 1px solid black !important;
  transform: translateX(-100%);
  transition: transform 0.2s ease-in-out !important;
}

.offcanvas.show {
  transform: translateX(10);
  transition: transform 0.2s ease-in-out !important;
}

.click-overlay {
  position: fixed;
  top: 75px;
  left: 33.33%;
  right: 0;
  bottom: 0;
  z-index: 1045;
  background: transparent;
}

.header-content {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  justify-content: space-between;
}

#fashionBotOffcanvasLabel{
font-family: 'Helvetica Neue', sans-serif;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-size: 100%;
}

h5 {
  font-weight: 400;
  text-transform: uppercase;
  color: black;
  font-size: 1.2rem;
  margin: 0;
  line-height: 80px;
}

.floating-bot {
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 12px 12px;
  background-color: black;
  color: white;
  border: none;
  font-family: 'Helvetica Neue', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1040;
  border: 1px black solid;
  border-radius: 100%;
  width: 65px;
  height: 65px;
}

.floating-bot:hover {
  background-color: white;
  border: 1px black solid;
  color: black;
}

@keyframes jump {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

.jumping {
  animation: jump 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.messages-wrapper {
  height: calc(100vh - 235px); /* 75px top + 80px header + 80px input */
  overflow-y: auto;
  padding: 20px;
  padding-bottom: 10px
}

.message {
  margin-bottom: 15px;
  max-width: 85%;
  font-family: 'Helvetica Neue', sans-serif;
  font-size: 0.875rem;
}

.bot-message {
  background-color: #f8f8f8;
  padding: 12px 15px;
  border-radius: 20px;
  margin-right: auto;
}

.user-message {
  background-color: black;
  color: white;
  padding: 12px 15px;
  border-radius: 20px;
  margin-left: auto;
}

.input-container {
  height: 80px;
  padding: 20px;
  background: white;
  border-top: 1px solid #e5e5e5;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.message-input {
  flex-grow: 1;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-family: 'Helvetica Neue', sans-serif;
  font-size: 0.875rem;
}

.button-group {
  display: flex;
  gap: 10px;
}

.upload-button, .send-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-button:hover, .send-button:hover {
  background: #f8f8f8;
}

.hidden-input {
  display: none;
}

.image-preview {
  position: absolute;
  top: -60px; /* Adjust based on the height of your image preview */
  left: 90%;
  transform: translateX(-50%);
  z-index: 1001;
}

.image-preview img {
  max-height: 50px;
  border-radius: 4px;
}

.clear-image-btn {
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
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #666;
  border-radius: 50%;
  animation: blink 1.4s infinite both;
}

@keyframes blink {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }

}

.bouncing {
  animation: bounce 1s ease;
}

.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.image-modal img {
  max-width: 90%;
  max-height: 90vh;
  border-radius: 4px;
}
.message-image {
  max-width: 100%;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.message-image:hover {
  transform: scale(1.05);
}
</style>