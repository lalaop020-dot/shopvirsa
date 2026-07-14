import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

const usePlatformStore = create(
  persist(
    (set, get) => ({
      balances: {},
      transactions: [],
      sellerSubscriptions: {},
      packageRequests: [],
      adminBankWithdrawals: [],
      adminTotalWithdrawn: 0,
      adminBalance: 0,

      addFundsToAdmin: (amount) => {
        const amt = parseFloat(amount)
        set((state) => ({
          adminBalance: (state.adminBalance || 0) + amt
        }))
      },

      requestAdminBankWithdrawal: (bankName, accountHolder, iban, amount) => {
        const amt = parseFloat(amount)
        const reqId = 'ADM-WD-' + Math.floor(1000 + Math.random() * 9000)
        const date = new Date().toISOString().split('T')[0]
        
        set((state) => ({
          adminTotalWithdrawn: state.adminTotalWithdrawn + amt,
          adminBankWithdrawals: [{
            id: reqId,
            bankName,
            accountHolder,
            iban,
            amount: amt,
            status: 'Processing',
            date
          }, ...state.adminBankWithdrawals]
        }))
      },

      addFundsToSeller: (email, amount) => {
        if (!email) return;
        const amt = parseFloat(amount)
        set((state) => {
          const currentBal = state.balances[email] || { balance: 0, withdrawable: 0, pendingDeposit: 0, totalWithdrawn: 0 }
          return {
            balances: {
              ...state.balances,
              [email]: {
                ...currentBal,
                balance: currentBal.balance + amt,
                withdrawable: currentBal.withdrawable + amt
              }
            }
          }
        })
      },

      addDepositRequest: (email, amount, txHash) => {
        const amt = parseFloat(amount)
        const txId = 'TX-' + Math.floor(100 + Math.random() * 900)
        const date = new Date().toISOString().split('T')[0]
        
        set((state) => {
          const currentBal = state.balances[email] || { balance: 0, withdrawable: 0, pendingDeposit: 0, totalWithdrawn: 0 }
          const updatedBalances = {
            ...state.balances,
            [email]: {
              ...currentBal,
              pendingDeposit: currentBal.pendingDeposit + amt
            }
          }
          const newTx = {
            id: txId,
            type: 'Deposit',
            amount: amt,
            status: 'Pending',
            date,
            method: 'USDT (TRC20)',
            sellerEmail: email,
            txHash
          }
          return {
            balances: updatedBalances,
            transactions: [newTx, ...state.transactions]
          }
        })
      },

      addWithdrawalRequest: (email, amount, walletAddress) => {
        const amt = parseFloat(amount)
        const txId = 'TX-' + Math.floor(100 + Math.random() * 900)
        const date = new Date().toISOString().split('T')[0]

        const currentBal = get().balances[email] || { balance: 0, withdrawable: 0, pendingDeposit: 0, totalWithdrawn: 0 }
        if (currentBal.withdrawable < amt) {
          return false
        }

        set((state) => {
          const updatedBalances = {
            ...state.balances,
            [email]: {
              ...currentBal,
              withdrawable: currentBal.withdrawable - amt
            }
          }
          const newTx = {
            id: txId,
            type: 'Withdrawal',
            amount: amt,
            status: 'Pending',
            date,
            method: 'USDT TRC20 / BTC',
            sellerEmail: email,
            walletAddress
          }
          return {
            balances: updatedBalances,
            transactions: [newTx, ...state.transactions]
          }
        })
        return true
      },

      approveDeposit: (txId) => {
        set((state) => {
          const tx = state.transactions.find(t => t.id === txId)
          if (!tx || tx.status !== 'Pending') return {}

          const email = tx.sellerEmail
          const currentBal = state.balances[email] || { balance: 0, withdrawable: 0, pendingDeposit: 0, totalWithdrawn: 0 }
          
          const updatedBalances = {
            ...state.balances,
            [email]: {
              ...currentBal,
              balance: currentBal.balance + tx.amount,
              withdrawable: currentBal.withdrawable + tx.amount,
              pendingDeposit: Math.max(0, currentBal.pendingDeposit - tx.amount)
            }
          }
          const updatedTxs = state.transactions.map(t => 
            t.id === txId ? { ...t, status: 'Approved' } : t
          )
          return {
            balances: updatedBalances,
            transactions: updatedTxs
          }
        })
      },

      rejectDeposit: (txId) => {
        set((state) => {
          const tx = state.transactions.find(t => t.id === txId)
          if (!tx || tx.status !== 'Pending') return {}

          const email = tx.sellerEmail
          const currentBal = state.balances[email] || { balance: 0, withdrawable: 0, pendingDeposit: 0, totalWithdrawn: 0 }
          
          const updatedBalances = {
            ...state.balances,
            [email]: {
              ...currentBal,
              pendingDeposit: Math.max(0, currentBal.pendingDeposit - tx.amount)
            }
          }
          const updatedTxs = state.transactions.map(t => 
            t.id === txId ? { ...t, status: 'Rejected' } : t
          )
          return {
            balances: updatedBalances,
            transactions: updatedTxs
          }
        })
      },

      approveWithdrawal: (txId) => {
        set((state) => {
          const tx = state.transactions.find(t => t.id === txId)
          if (!tx || tx.status !== 'Pending') return {}

          const email = tx.sellerEmail
          const currentBal = state.balances[email] || { balance: 0, withdrawable: 0, pendingDeposit: 0, totalWithdrawn: 0 }
          
          const updatedBalances = {
            ...state.balances,
            [email]: {
              ...currentBal,
              balance: Math.max(0, currentBal.balance - tx.amount),
              totalWithdrawn: currentBal.totalWithdrawn + tx.amount
            }
          }
          const updatedTxs = state.transactions.map(t => 
            t.id === txId ? { ...t, status: 'Approved' } : t
          )
          return {
            balances: updatedBalances,
            transactions: updatedTxs
          }
        })
      },

      rejectWithdrawal: (txId) => {
        set((state) => {
          const tx = state.transactions.find(t => t.id === txId)
          if (!tx || tx.status !== 'Pending') return {}

          const email = tx.sellerEmail
          const currentBal = state.balances[email] || { balance: 0, withdrawable: 0, pendingDeposit: 0, totalWithdrawn: 0 }
          
          const updatedBalances = {
            ...state.balances,
            [email]: {
              ...currentBal,
              withdrawable: currentBal.withdrawable + tx.amount
            }
          }
          const updatedTxs = state.transactions.map(t => 
            t.id === txId ? { ...t, status: 'Rejected' } : t
          )
          return {
            balances: updatedBalances,
            transactions: updatedTxs
          }
        })
      },

      addPackageRequest: (email, packageName, price, walletAddress, txHash) => {
        const reqId = 'PKG-' + Math.floor(100 + Math.random() * 900)
        const date = new Date().toISOString().split('T')[0]
        const newReq = {
          id: reqId,
          sellerEmail: email,
          packageName,
          price,
          status: 'Pending',
          walletAddress,
          txHash,
          date
        }
        set((state) => ({
          packageRequests: [newReq, ...state.packageRequests]
        }))
      },

      approvePackageRequest: (reqId) => {
        set((state) => {
          const req = state.packageRequests.find(r => r.id === reqId)
          if (!req) return {}

          const email = req.sellerEmail
          const updatedSubs = {
            ...state.sellerSubscriptions,
            [email]: { name: req.packageName, status: 'Active' }
          }
          const updatedReqs = state.packageRequests.map(r => 
            r.id === reqId ? { ...r, status: 'Approved' } : r
          )
          return {
            sellerSubscriptions: updatedSubs,
            packageRequests: updatedReqs
          }
        })
      },

      rejectPackageRequest: (reqId) => {
        set((state) => {
          const updatedReqs = state.packageRequests.map(r => 
            r.id === reqId ? { ...r, status: 'Rejected' } : r
          )
          return {
            packageRequests: updatedReqs
          }
        })
      },

      freezePackage: (email) => {
        set((state) => {
          const sub = state.sellerSubscriptions[email] || { name: 'Silver', status: 'Active' }
          return {
            sellerSubscriptions: {
              ...state.sellerSubscriptions,
              [email]: { ...sub, status: 'Frozen' }
            }
          }
        })
      },

      unfreezePackage: (email) => {
        set((state) => {
          const sub = state.sellerSubscriptions[email] || { name: 'Silver', status: 'Active' }
          return {
            sellerSubscriptions: {
              ...state.sellerSubscriptions,
              [email]: { ...sub, status: 'Active' }
            }
          }
        })
      }
    }),
    {
      name: 'platform-storage-v2',
    }
  )
)

export default usePlatformStore
