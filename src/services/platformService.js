import api from '../api/axios'

export const platformService = {
  // Wallet
  getBalance: async () => {
    const response = await api.get('/wallet/balance')
    return response.data
  },

  submitDeposit: async (formData) => {
    // Note: This expects multipart/form-data if uploading proof
    const response = await api.post('/wallet/deposit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  requestWithdrawal: async (data) => {
    const response = await api.post('/wallet/withdraw', data)
    return response.data
  },

  getMyTransactions: async (params) => {
    const response = await api.get('/wallet/transactions', { params })
    return response.data
  },

  // Admin Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats')
    return response.data
  },

  // Admin Sellers
  getPendingSellers: async () => {
    const response = await api.get('/admin/sellers/pending')
    return response.data
  },

  getAllSellers: async () => {
    const response = await api.get('/admin/sellers')
    return response.data
  },

  approveSeller: async (sellerId) => {
    const response = await api.put(`/admin/sellers/${sellerId}/approve`)
    return response.data
  },

  rejectSeller: async (sellerId) => {
    const response = await api.put(`/admin/sellers/${sellerId}/reject`)
    return response.data
  },

  // Admin Transactions
  getAllTransactions: async (params) => {
    const response = await api.get('/admin/transactions', { params })
    return response.data
  },

  approveTransaction: async (txId) => {
    const response = await api.put(`/admin/transactions/${txId}/approve`)
    return response.data
  },

  rejectTransaction: async (txId) => {
    const response = await api.put(`/admin/transactions/${txId}/reject`)
    return response.data
  },
  
  // Package Requests (Admin)
  getAllPackageRequests: async () => {
    const response = await api.get('/admin/requests')
    return response.data
  },

  approvePackage: async (reqId) => {
    const response = await api.put(`/admin/requests/${reqId}/approve`)
    return response.data
  },

  rejectPackage: async (reqId) => {
    const response = await api.put(`/admin/requests/${reqId}/reject`)
    return response.data
  }
}
