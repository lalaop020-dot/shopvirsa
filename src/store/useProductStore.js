import { create } from 'zustand'
import { productService } from '../services/productService'

export const useProductStore = create((set, get) => ({
  storeroomProducts: [],
  sellerProducts: [], // Now an array for the currently authenticated seller
  marketplaceProducts: [],
  categories: [],
  isLoading: false,
  error: null,

  // Admin actions
  fetchStoreroomProducts: async (params) => {
    set({ isLoading: true })
    try {
      const data = await productService.getAllProducts(params)
      // Assuming backend returns array or { items: array }
      const products = Array.isArray(data) ? data : (data.items || data.data || [])
      set({ storeroomProducts: products, error: null })
    } catch (error) {
      set({ error: error.message })
    } finally {
      set({ isLoading: false })
    }
  },

  addStoreroomProduct: async (product) => {
    try {
      await productService.createProduct(product)
      await get().fetchStoreroomProducts()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },

  editStoreroomProduct: async (id, updated) => {
    try {
      await productService.updateGlobalProduct(id, updated)
      await get().fetchStoreroomProducts()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },

  removeStoreroomProduct: async (id) => {
    try {
      await productService.deleteGlobalProduct(id)
      await get().fetchStoreroomProducts()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },

  bulkUploadProducts: async (productsJson) => {
    try {
      const list = JSON.parse(productsJson)
      if (!Array.isArray(list)) throw new Error('Data must be an array of products')
      await productService.bulkUpload(list)
      await get().fetchStoreroomProducts()
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  },

  // Seller actions
  fetchSellerProducts: async () => {
    set({ isLoading: true })
    try {
      const data = await productService.getSellerProducts()
      const products = Array.isArray(data) ? data : (data.items || data.data || [])
      set({ sellerProducts: products, error: null })
    } catch (error) {
      set({ error: error.message })
    } finally {
      set({ isLoading: false })
    }
  },

  // Notice we don't need sellerEmail anymore, the backend token handles it
  importProductToSellerStore: async (_, globalId) => {
    try {
      await productService.importProduct(globalId)
      await get().fetchSellerProducts()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },

  removeSellerProduct: async (_, id) => {
    try {
      await productService.deleteSellerProduct(id)
      await get().fetchSellerProducts()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },

  updateSellerProduct: async (_, id, updates) => {
    try {
      await productService.updateSellerProduct(id, updates)
      await get().fetchSellerProducts()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },

  // Shared
  fetchCategories: async () => {
    try {
      const data = await productService.getCategories()
      set({ categories: Array.isArray(data) ? data : (data.categories || []) })
    } catch (error) {
      console.error(error)
    }
  },
  
  fetchMarketplaceProducts: async (params) => {
    set({ isLoading: true })
    try {
      const data = await productService.getMarketplaceProducts(params)
      const products = Array.isArray(data) ? data : (data.items || data.data || [])
      set({ marketplaceProducts: products, error: null })
    } catch (error) {
      set({ error: error.message })
    } finally {
      set({ isLoading: false })
    }
  }
}))
