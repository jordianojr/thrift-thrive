<template>
  <transition name="fade">
    <div v-if="visible" class="notification" :class="alertType">
      <span class="alert-message">{{ message }}</span>
      <button class="close-button" @click="closeAlert">×</button>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: '',
    },
    alertType: {
      type: String,
      default: 'info',
    },
    timeout: {
      type: Number,
      default: 3000, // Default timeout of 3 seconds
    },
  },
  watch: {
    visible(newValue) {
      if (newValue) {
        this.startTimer();
      }
    },
  },
  methods: {
    closeAlert() {
      this.$emit('update:visible', false);
    },
    startTimer() {
      setTimeout(() => {
        this.closeAlert();
      }, this.timeout);
    },
  },
  mounted() {
    if (this.visible) {
      this.startTimer();
    }
  },
};
</script>

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