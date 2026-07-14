import api from '../api/axios'

export const productService = {
  // Get all products (storefront)
  getAllProducts: async (params) => {
    const response = await api.get('/products', { params })
    return response.data
  },

  // Get single product
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  // Seller: Get shop products
  getSellerProducts: async () => {
    const response = await api.get('/seller/products')
    return response.data
  },

  // Seller: Add product
  addProduct: async (data) => {
    const response = await api.post('/seller/products', data)
    return response.data
  },

  // Seller: Update product
  updateProduct: async (id, data) => {
    const response = await api.put(`/seller/products/${id}`, data)
    return response.data
  },

  // Seller: Import from storehouse
  importProduct: async (productId) => {
    const response = await api.post('/seller/import', { productId })
    return response.data
  }
}
