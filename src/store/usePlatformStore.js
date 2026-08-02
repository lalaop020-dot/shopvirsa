import { create } from 'zustand'
import { platformService } from '../services/platformService'

export const DEFAULT_BALANCE = Object.freeze({
  balance: 0,
  withdrawable: 0,
  pendingDeposit: 0,
  totalWithdrawn: 0
})

export const DEFAULT_SUBSCRIPTION = Object.freeze({
  name: 'Silver',
  status: 'Active'
})

const usePlatformStore = create((set, get) => ({
  balance: DEFAULT_BALANCE,
  transactions: [],
  dashboardStats: null,
  pendingSellers: [],
  allSellers: [],
  packageRequests: [],
  adminBankWithdrawals: [],
  adminTotalWithdrawn: 0,
  isLoading: false,
  error: null,

  fetchBalance: async () => {
    set({ isLoading: true })
    try {
      const data = await platformService.getBalance()
      // data might be { balance: 0, ... }
      set({ balance: data, error: null })
    } catch (error) {
      set({ error: error.message })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchMyTransactions: async (params) => {
    set({ isLoading: true })
    try {
      const data = await platformService.getMyTransactions(params)
      const txs = Array.isArray(data) ? data : (data.items || data.data || [])
      set({ transactions: txs, error: null })
    } catch (error) {
      set({ error: error.message })
    } finally {
      set({ isLoading: false })
    }
  },

  submitDeposit: async (formData) => {
    try {
      await platformService.submitDeposit(formData)
      await get().fetchBalance()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },

  requestWithdrawal: async (data) => {
    try {
      await platformService.requestWithdrawal(data)
      await get().fetchBalance()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },

  requestAdminBankWithdrawal: (bankName, accountHolder, iban, amount) => {
    const newReq = {
      id: `WDR-${Date.now().toString().slice(-6)}`,
      bankName,
      accountHolder,
      iban,
      amount,
      status: 'Pending',
      date: new Date().toLocaleDateString()
    }
    set((state) => ({
      adminBankWithdrawals: [newReq, ...state.adminBankWithdrawals],
      adminTotalWithdrawn: state.adminTotalWithdrawn + amount
    }))
  },

  // Admin Dashboard
  fetchDashboardStats: async () => {
    set({ isLoading: true })
    try {
      const stats = await platformService.getDashboardStats()
      set({ dashboardStats: stats, error: null })
    } catch (error) {
      set({ error: error.message })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchAllTransactions: async (params) => {
    set({ isLoading: true })
    try {
      const data = await platformService.getAllTransactions(params)
      const txs = Array.isArray(data) ? data : (data.items || data.data || [])
      set({ transactions: txs, error: null })
    } catch (error) {
      set({ error: error.message })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchPendingSellers: async () => {
    try {
      const data = await platformService.getPendingSellers()
      const sellers = Array.isArray(data) ? data : (data.items || data.data || [])
      set({ pendingSellers: sellers })
    } catch (error) {
      console.error(error)
    }
  },

  fetchAllSellers: async () => {
    try {
      const data = await platformService.getAllSellers()
      const sellers = Array.isArray(data) ? data : (data.items || data.data || [])
      set({ allSellers: sellers })
    } catch (error) {
      console.error(error)
    }
  },

  approveSeller: async (sellerId) => {
    try {
      await platformService.approveSeller(sellerId)
      await get().fetchPendingSellers()
      await get().fetchAllSellers()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },

  rejectSeller: async (sellerId) => {
    try {
      await platformService.rejectSeller(sellerId)
      await get().fetchPendingSellers()
      await get().fetchAllSellers()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },

  approveTransaction: async (txId) => {
    try {
      await platformService.approveTransaction(txId)
      await get().fetchAllTransactions()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },

  rejectTransaction: async (txId) => {
    try {
      await platformService.rejectTransaction(txId)
      await get().fetchAllTransactions()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },

  fetchAllPackageRequests: async () => {
    try {
      const data = await platformService.getAllPackageRequests()
      const reqs = Array.isArray(data) ? data : (data.items || data.data || [])
      set({ packageRequests: reqs })
    } catch (error) {
      console.error(error)
    }
  },

  approvePackage: async (reqId) => {
    try {
      await platformService.approvePackage(reqId)
      await get().fetchAllPackageRequests()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  },

  rejectPackage: async (reqId) => {
    try {
      await platformService.rejectPackage(reqId)
      await get().fetchAllPackageRequests()
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }
}))

export default usePlatformStore
