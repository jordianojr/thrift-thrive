<template>
  <transition name="fade">
    <div v-if="visible" class="notification" :class="alertType">
      <span class="alert-message">{{ message }}</span>
      <button class="close-button" @click="closeAlert">×</button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue'

// Define props with TypeScript interface
interface Props {
  visible: boolean
  message: string
  alertType: 'info' | 'success' | 'warning' | 'error'
  timeout?: number
}

// Define props with default values
const props = withDefaults(defineProps<Props>(), {
  visible: false,
  message: '',
  alertType: 'info',
  timeout: 3000
})

// Define emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

// Methods
const closeAlert = () => {
  emit('update:visible', false)
}

const startTimer = () => {
  setTimeout(() => {
    closeAlert()
  }, props.timeout)
}

// Watchers
watch(() => props.visible, (newValue) => {
  if (newValue) {
    startTimer()
  }
})

// Lifecycle hooks
onMounted(() => {
  if (props.visible) {
    startTimer()
  }
})</script>

<style scoped>
.notification {
  position: fixed;
  bottom: 20px;
  /* Changed from top to bottom */
  left: 20px;
  /* Changed from right to left */
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  min-width: 200px;
  max-width: 400px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification.info {
  background-color: #d9edf7;
  color: #31708f;
}

.notification.success {
  background-color: #dff0d8;
  color: #3c763d;
}

.notification.warning {
  background-color: #fcf8e3;
  color: #8a6d3b;
}

.notification.error {
  background-color: #f2dede;
  color: #a94442;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  margin-left: 10px;
  padding: 0 5px;
}

.alert-message {
  flex-grow: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>