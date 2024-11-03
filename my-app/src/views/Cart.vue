<template>
  <div class="cart-container">
    <h2 class="text-white mb-4">Shopping Cart</h2>
    
    <div v-if="cartStore.items.length === 0" class="text-white text-center">
      <p>Your cart is empty</p>
      <router-link to="/marketplace" class="btn btn-success">Continue Shopping</router-link>
    </div>

    <div v-else>
      <div class="cart-items">
        <div v-for="item in cartStore.items" :key="item.id" class="cart-item card mb-3">
          <div class="row g-0">
            <div class="col-md-2">
              <img :src="item.image" class="img-fluid rounded-start" :alt="item.name">
            </div>
            <div class="col-md-10">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="card-title">{{ item.name }}</h5>
                  <button @click="cartStore.removeItem(item.id)" class="btn btn-danger btn-sm">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
                <p class="card-text">Price: ${{ item.price }}</p>
                <div class="quantity-controls">
                  <button 
                    class="btn btn-sm btn-secondary"
                    @click="updateQuantity(item, -1)"
                    :disabled="item.quantity <= 1">
                    -
                  </button>
                  <span class="mx-2">{{ item.quantity }}</span>
                  <button 
                    class="btn btn-sm btn-secondary"
                    @click="updateQuantity(item, 1)">
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>          <div class="cart-summary card mt-4">
            <div class="card-body">
              <h5 class="card-title">Cart Summary</h5>
              <p class="card-text">Total Items: {{ cartStore.totalQuantity }}</p>
              <p class="card-text">Total Price: ${{ cartStore.totalPrice }}</p>
              <button 
                class="btn btn-success w-100" 
                @click="handleCheckout"
                :disabled="isProcessing">
                {{ isProcessing ? 'Processing...' : 'Proceed to Checkout' }}
              </button>
            </div>
          </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from '@/stores/cartStore'
import type { CartItem } from '@/stores/cartStore'
import { stripePromise } from '@/lib/stripeConfig'

const cartStore = useCartStore()
const isProcessing = ref(false)

const handleCheckout = async () => {
  try {
    isProcessing.value = true
    
    // Create a line items array for Stripe
    const lineItems = cartStore.items.map(item => ({
      price_data: {
        currency: 'sgd',
        product_data: {
          name: item.name,
          images: [item.image]
        },
        unit_amount: Math.round(item.price * 100) // Convert to cents
      },
      quantity: item.quantity
    }))

    // Call your backend endpoint to create a Stripe session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lineItems })
    })

    const { sessionId } = await response.json()
    
    // Redirect to Stripe checkout
    const stripe = await stripePromise
    if (stripe) {
      await stripe.redirectToCheckout({ sessionId })
    }
  } catch (error) {
    console.error('Error during checkout:', error)
    alert('There was an error processing your payment. Please try again.')
  } finally {
    isProcessing.value = false
  }
}

const updateQuantity = (item: CartItem, change: number) => {
  const newQuantity = item.quantity + change
  if (newQuantity < 1) return
  
  item.quantity = newQuantity
}
</script>

<style scoped>
.cart-container {
  padding: 20px;
}

.cart-item {
  background-color: white;
}

.cart-item img {
  height: 150px;
  object-fit: cover;
}

.quantity-controls {
  display: flex;
  align-items: center;
}

.cart-summary {
  max-width: 400px;
  margin-left: auto;
}
</style>
