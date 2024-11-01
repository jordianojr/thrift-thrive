import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '@/stores/cartStore'

describe('Cart Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with empty cart', () => {
    const cart = useCartStore()
    expect(cart.items).toEqual([])
    expect(cart.totalQuantity).toBe(0)
    expect(cart.totalPrice).toBe(0)
  })

  it('can add item to cart', () => {
    const cart = useCartStore()
    const testItem = {
      id: '1',
      name: 'Test Item',
      price: 10,
      quantity: 1,
      image: 'test.jpg'
    }
    
    cart.addItemToCart(testItem)
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]).toEqual({ ...testItem, quantity: 1 })
    expect(cart.totalQuantity).toBe(1)
    expect(cart.totalPrice).toBe(10)
  })

  it('increases quantity for existing item', () => {
    const cart = useCartStore()
    const testItem = {
      id: '1',
      name: 'Test Item',
      price: 10,
      quantity: 1,
      image: 'test.jpg'
    }
    
    cart.addItemToCart(testItem)
    cart.addItemToCart(testItem)
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].quantity).toBe(2)
    expect(cart.totalQuantity).toBe(2)
    expect(cart.totalPrice).toBe(20)
  })

  it('can remove item from cart', () => {
    const cart = useCartStore()
    const testItem = {
      id: '1',
      name: 'Test Item',
      price: 10,
      quantity: 1,
      image: 'test.jpg'
    }
    
    cart.addItemToCart(testItem)
    expect(cart.items).toHaveLength(1)
    
    cart.removeItem('1')
    expect(cart.items).toHaveLength(0)
    expect(cart.totalQuantity).toBe(0)
    expect(cart.totalPrice).toBe(0)
  })

  it('correctly calculates total price with multiple items', () => {
    const cart = useCartStore()
    const item1 = {
      id: '1',
      name: 'Item 1',
      price: 10,
      quantity: 1,
      image: 'test1.jpg'
    }
    const item2 = {
      id: '2',
      name: 'Item 2',
      price: 20,
      quantity: 1,
      image: 'test2.jpg'
    }
    
    cart.addItemToCart(item1)
    cart.addItemToCart(item2)
    cart.addItemToCart(item1) // Add item1 again
    
    expect(cart.items).toHaveLength(2)
    expect(cart.totalQuantity).toBe(3)
    expect(cart.totalPrice).toBe(40) // (10 * 2) + (20 * 1)
  })

  it('handles removing non-existent items gracefully', () => {
    const cart = useCartStore()
    const testItem = {
      id: '1',
      name: 'Test Item',
      price: 10,
      quantity: 1,
      image: 'test.jpg'
    }
    
    cart.addItemToCart(testItem)
    cart.removeItem('non-existent-id')
    
    expect(cart.items).toHaveLength(1)
    expect(cart.totalQuantity).toBe(1)
    expect(cart.totalPrice).toBe(10)
  })

  it('can clear the entire cart', () => {
    const cart = useCartStore()
    const testItem1 = {
      id: '1',
      name: 'Test Item 1',
      price: 10,
      quantity: 1,
      image: 'test1.jpg'
    }
    const testItem2 = {
      id: '2',
      name: 'Test Item 2',
      price: 20,
      quantity: 1,
      image: 'test2.jpg'
    }
    
    cart.addItemToCart(testItem1)
    cart.addItemToCart(testItem2)
    expect(cart.items).toHaveLength(2)
    
    cart.clearCart()
    expect(cart.items).toHaveLength(0)
    expect(cart.totalQuantity).toBe(0)
    expect(cart.totalPrice).toBe(0)
  })
})
