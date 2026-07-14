import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      role: null, // 'admin' | 'seller' | 'customer'
      isAuthenticated: false,
      token: null,
      adminEmail: 'admin@shopiversa.com',
      adminPassword: 'adminpassword123',
      adminWallets: {
        usdt: 'TY6b8f9G2h7L1m5N3k8R0q4Wp1Xz9VcV7b',
        btc: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
      },
      registeredUsers: [],

      registerUser: (name, email, password, role) => set((state) => {
        // Check if user already exists
        if (state.registeredUsers.find(u => u.email === email)) {
          throw new Error('Email already registered')
        }
        const newUser = { name, email, password, role }
        return {
          registeredUsers: [...state.registeredUsers, newUser]
        }
      }),

      setAuth: (user, role, token) => set({ 
        user, 
        role, 
        token, 
        isAuthenticated: !!user 
      }),

      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, role: null, token: null, isAuthenticated: false })
      },

      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData }
      })),

      updateAdminCredentials: (email, password) => set({
        adminEmail: email,
        adminPassword: password
      }),

      updateAdminWallets: (usdt, btc) => set((state) => ({
        adminWallets: { ...state.adminWallets, usdt, btc }
      }))
    }),
    {
      name: 'auth-storage-v2',
    }
  )
)

export default useAuthStore
