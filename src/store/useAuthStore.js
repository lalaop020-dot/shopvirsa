import { create } from 'zustand'
import api from '../api/axios'

const useAuthStore = create((set, get) => ({
  user: null,
  role: null, // 'admin' | 'seller' | 'customer'
  isAuthenticated: false,
  token: localStorage.getItem('token') || null,
  
  // Real login API call
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      // Assuming response.data has { token: string }
      const token = response.data.token || response.data.access_token // depending on fastapi return format
      
      if (token) {
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
      if (!token) {
        set({ user: null, role: null, isAuthenticated: false, token: null })
        return null
      }
      
      const response = await api.get('/auth/me')
      const userData = response.data
      
      // Assume role is returned in userData, default to customer if missing
      const role = userData.role || 'customer'
      
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
