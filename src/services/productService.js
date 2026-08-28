import api from '../api/axios'

export const productService = {
  // Public/Customer Marketplace
  // Backend limit: maximum=100, minimum=1, default=50 (per OpenAPI spec)
  getMarketplaceProducts: async (params = {}) => {
    const response = await api.get('/marketplace/products', { params: { limit: 100, ...params } })
    return response.data
  },

  // Admin/Global products (Storehouse)
  // Backend limit: maximum=200, minimum=1, default=50 (per OpenAPI spec)
  getAllProducts: async (params = {}) => {
    const response = await api.get('/products', { params: { limit: 200, ...params } })
    return response.data
  },
  
  createProduct: async (data) => {
    const response = await api.post('/products', data)
    return response.data
  },
  
  updateGlobalProduct: async (id, data) => {
    const response = await api.put(`/products/${id}`, data)
    return response.data
  },
  
  deleteGlobalProduct: async (id) => {
    const response = await api.delete(`/products/${id}`)
    return response.data
  },
  
  bulkUpload: async (data) => {
    const response = await api.post('/products/bulk', data)
    return response.data
  },

  // Get single product
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  getCategories: async () => {
    const response = await api.get('/products/categories')
    return response.data
  },

  // Seller: Get shop products
  // Backend /seller/products has no limit/page params — returns all seller products
  getSellerProducts: async () => {
    const response = await api.get('/seller/products')
    return response.data
  },

  // Seller: Update product
  updateSellerProduct: async (id, data) => {
    const response = await api.put(`/seller/products/${id}`, data)
    return response.data
  },
  
  deleteSellerProduct: async (id) => {
    const response = await api.delete(`/seller/products/${id}`)
    return response.data
  },

  // Seller: Import from storehouse
  importProduct: async (globalId) => {
    const response = await api.post(`/seller/products/import/${globalId}`)
    return response.data
  }
}
