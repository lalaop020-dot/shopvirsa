import { create } from 'zustand'
import { orderService } from '../services/orderService'

const useOrderStore = create((set, get) => ({
  orders: [],
  isLoading: false,
  error: null,

  fetchMyOrders: async () => {
    set({ isLoading: true })
    try {
      const data = await orderService.getMyOrders()
      const orders = Array.isArray(data) ? data : (data.items || data.data || [])
      set({ orders, error: null })
    } catch (error) {
      set({ error: error.message })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchCustomerOrders: async () => {
    set({ isLoading: true })
    try {
      const data = await orderService.getCustomerOrders()
      const orders = Array.isArray(data) ? data : (data.items || data.data || [])
      set({ orders, error: null })
    } catch (error) {
      set({ error: error.message })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchSellerOrders: async () => {
    set({ isLoading: true })
    try {
      const data = await orderService.getSellerOrders()
      const orders = Array.isArray(data) ? data : (data.items || data.data || [])
      set({ orders, error: null })
    } catch (error) {
      set({ error: error.message })
    } finally {
      set({ isLoading: false })
    }
  },

  createOrder: async (cartItems, shippingInfo, paymentMethod) => {
    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.globalId || item.id, // Using globalId if from marketplace
          name: item.name,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity),
          image: item.image || null,
          category: item.category || null,
          sellerEmail: item.sellerEmail || null
        })),
        shippingAddress: {
          name: shippingInfo.name,
          address: shippingInfo.address,
          city: shippingInfo.city,
          zip: shippingInfo.zip,
          email: shippingInfo.email || null
        },
        paymentMethod: paymentMethod
      }
      
      const newOrder = await orderService.createOrder(orderData)
      return newOrder
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      await orderService.updateOrderStatus(orderId, status)
      // refresh orders
      await get().fetchMyOrders()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }
}))

export default useOrderStore
