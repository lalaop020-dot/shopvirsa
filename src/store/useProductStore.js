import { create } from 'zustand'
import { productService } from '../services/productService'

export const useProductStore = create((set, get) => ({
  storeroomProducts: [],
  sellerProducts: [],
  marketplaceProducts: [],
  categories: [],

  // Per-feature loading/error states (prevents cross-contamination between pages)
  storeroomLoading: false,
  sellerLoading: false,
  marketplaceLoading: false,
  storeroomError: null,
  sellerError: null,
  marketplaceError: null,

  // Legacy isLoading alias (derived from individual states via getter-style approach)
  isLoading: false,
  error: null,

  // Admin actions
  fetchStoreroomProducts: async (params) => {
    set({ storeroomLoading: true, storeroomError: null })
    try {
      const data = await productService.getAllProducts(params)
      let products = Array.isArray(data) ? data : (data.items || data.products || data.data?.products || data.data || [])
      if (!Array.isArray(products)) products = []
      set({ storeroomProducts: products, storeroomError: null })
    } catch (error) {
      const message = error?.response?.data?.detail?.[0]?.msg
        || error?.response?.data?.message
        || error?.message
        || 'Failed to load storeroom products. Check your connection.'
      set({ storeroomError: message, storeroomProducts: [] })
      console.error('[ProductStore] fetchStoreroomProducts — backend response:', error?.response?.data || error?.message)
    } finally {
      set({ storeroomLoading: false })
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
    set({ sellerLoading: true, sellerError: null })
    try {
      const data = await productService.getSellerProducts()
      let products = Array.isArray(data) ? data : (data.items || data.products || data.data?.products || data.data || [])
      if (!Array.isArray(products)) products = []
      set({ sellerProducts: products, sellerError: null })
    } catch (error) {
      const message = error?.response?.data?.detail?.[0]?.msg
        || error?.response?.data?.message
        || error?.message
        || 'Failed to load your products. Check your connection.'
      set({ sellerError: message, sellerProducts: [] })
      console.error('[ProductStore] fetchSellerProducts — backend response:', error?.response?.data || error?.message)
    } finally {
      set({ sellerLoading: false })
    }
  },

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
      let categories = Array.isArray(data) ? data : (data.categories || data.data?.categories || data.data || [])
      if (!Array.isArray(categories)) categories = []
      set({ categories })
    } catch (error) {
      console.error('[ProductStore] fetchCategories:', error)
    }
  },

  fetchMarketplaceProducts: async (params) => {
    set({ marketplaceLoading: true, marketplaceError: null })
    try {
      const data = await productService.getMarketplaceProducts(params)
      let products = Array.isArray(data) ? data : (data.items || data.products || data.data?.products || data.data || [])
      if (!Array.isArray(products)) products = []
      set({ marketplaceProducts: products, marketplaceError: null })
    } catch (error) {
      const message = error?.response?.data?.detail?.[0]?.msg
        || error?.response?.data?.message
        || error?.message
        || 'Failed to load marketplace products. Check your connection.'
      set({ marketplaceError: message, marketplaceProducts: [] })
      console.error('[ProductStore] fetchMarketplaceProducts — backend response:', error?.response?.data || error?.message)
    } finally {
      set({ marketplaceLoading: false })
    }
  }
}))
