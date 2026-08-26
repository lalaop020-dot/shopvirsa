import { create } from 'zustand'
import api from '../api/axios'

const determineRole = (user) => {
  if (!user) return 'customer'
  const rawRole = (user.role || user.user_type || user.type || user.role_name || '').toString().toLowerCase()
  if (rawRole === 'seller' || rawRole === 'admin' || rawRole === 'customer') {
    return rawRole
  }
  if (user.is_admin || user.isAdmin) return 'admin'
  if (user.is_seller || user.isSeller || user.shopName || user.shop_name || user.shopEmail || user.shop_email) return 'seller'
  return 'customer'
}

const useAuthStore = create((set, get) => ({
  user: null,
  role: null, // 'admin' | 'seller' | 'customer'
  isAuthenticated: false,
  token: localStorage.getItem('token') || null,
  isInitializing: true,

  // Rehydrates auth state from the stored token on app load
  initAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token || token === 'undefined' || token === 'null') {
      set({ isInitializing: false })
      return
    }
    await get().fetchMe()
    set({ isInitializing: false })
  },

  // Real login API call
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      // Support direct or nested token response formats
      const token = response.data?.token || 
                    response.data?.access_token || 
                    response.data?.data?.token || 
                    response.data?.data?.access_token
      
      if (token && token !== 'undefined') {
        localStorage.setItem('token', token)
        set({ token })
        await get().fetchMe()
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error.response?.data || error)
      throw new Error(error.response?.data?.detail || 'Invalid credentials')
    }
  },

  // Customer register API call
  registerCustomer: async (name, email, password) => {
    try {
      await api.post('/auth/register', { name, email, password })
      return true
    } catch (error) {
      console.error('Register error:', error.response?.data || error)
      throw new Error(error.response?.data?.detail || 'Registration failed')
    }
  },

  // Seller register API call
  registerSeller: async (name, shopName, email, password) => {
    try {
      await api.post('/auth/register/seller', { name, shopName, email, password })
      return true
    } catch (error) {
      console.error('Seller Register error:', error.response?.data || error)
      throw new Error(error.response?.data?.detail || 'Seller registration failed')
    }
  },

  // Fetch me API call
  fetchMe: async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token || token === 'undefined' || token === 'null') {
        set({ user: null, role: null, isAuthenticated: false, token: null })
        return null
      }
      
      const response = await api.get('/auth/me')
      const userData = response.data?.user || response.data?.data?.user || response.data?.data || response.data
      
      const role = determineRole(userData)
      
      set({ 
        user: userData, 
        role: role, 
        isAuthenticated: true 
      })
      return userData
    } catch (error) {
      console.error('Fetch me error:', error.response?.data || error)
      localStorage.removeItem('token')
      set({ user: null, role: null, isAuthenticated: false, token: null })
      return null
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        // Optional: call logout on backend if it invalidates tokens
        await api.post('/auth/logout').catch(() => {}) 
      }
    } finally {
      localStorage.removeItem('token')
      set({ user: null, role: null, token: null, isAuthenticated: false })
    }
  },

  // Keep these just in case any UI still depends on the structure, but ideally remove them
  updateUser: (userData) => set((state) => ({
    user: { ...state.user, ...userData }
  })),
}))

export default useAuthStore
