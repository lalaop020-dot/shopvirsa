import { create } from 'zustand'
import api from '../api/axios'

const useChatStore = create((set, get) => ({
  conversations: {},
  activeChats: [],

  fetchConversations: async () => {
    try {
      const res = await api.get('/chat/conversations')
      set({ activeChats: Array.isArray(res.data) ? res.data : (res.data?.items || []) })
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    }
  },

  fetchMessages: async (partnerEmail) => {
    try {
      const res = await api.get(`/chat/messages/${partnerEmail}`)
      const msgs = Array.isArray(res.data) ? res.data : (res.data?.items || [])
      set(state => ({
        conversations: {
          ...state.conversations,
          [partnerEmail]: msgs
        }
      }))
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  },

  getMessages: (email) => {
    return get().conversations[email] || []
  },

  getActiveConversations: () => {
    return get().activeChats
  },

  sendMessage: async (recipientEmail, text) => {
    try {
      await api.post('/chat/messages', { recipientEmail, text })
      await get().fetchMessages(recipientEmail)
      await get().fetchConversations()
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }
}))

export default useChatStore
