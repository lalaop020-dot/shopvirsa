import api from '../api/axios'

export const orderService = {
  // Create an order (Customer)
  createOrder: async (data) => {
    const response = await api.post('/orders', data)
    return response.data
  },

  // Admin: Create order on behalf of a customer/seller
  adminCreateOrder: async (data) => {
    const response = await api.post('/admin/orders', data)
    return response.data
  },

  // Admin: Get all orders across all sellers
  getAllOrders: async (params) => {
    const response = await api.get('/admin/orders', { params })
    return response.data
  },

  // Get orders based on role
  getMyOrders: async () => {
    const response = await api.get('/orders')
    return response.data
  },

  // Get customer specific orders
  getCustomerOrders: async () => {
    const response = await api.get('/orders/customer')
    return response.data
  },

  // Get seller specific orders
  getSellerOrders: async () => {
    const response = await api.get('/orders/seller')
    return response.data
  },

  // Get single order
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`)
    return response.data
  },

  // Update order status (Seller/Admin)
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, { status })
    return response.data
  }
}
