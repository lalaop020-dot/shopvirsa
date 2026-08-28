import { create } from 'zustand'
import api from '../api/axios'

const useChatStore = create((set, get) => ({
  conversations: {},
  activeChats: [],

  fetchConversations: async () => {
    try {
      const res = await api.get('/chat/conversations')
      let chats = Array.isArray(res.data) ? res.data : (res.data?.conversations || res.data?.items || res.data?.data?.conversations || res.data?.data || [])
      if (!Array.isArray(chats)) chats = []
      set({ activeChats: chats })
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    }
  },

  fetchMessages: async (partnerEmail) => {
    try {
      const res = await api.get(`/chat/messages/${partnerEmail}`)
      let msgs = Array.isArray(res.data) ? res.data : (res.data?.messages || res.data?.items || res.data?.data?.messages || res.data?.data || [])
      if (!Array.isArray(msgs)) msgs = []
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

  sendMessage: async (recipientEmail, text, attachment = null) => {
    try {
      if (attachment) {
        const toBase64 = (file) => new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => resolve(reader.result)
          reader.onerror = error => reject(error)
        })
        const base64Data = await toBase64(attachment)
        
        await api.post('/chat/messages', { 
          recipientEmail, 
          text: text || '',
          attachment: base64Data,
          attachmentName: attachment.name,
          attachmentType: attachment.type
        })
      } else {
        await api.post('/chat/messages', { recipientEmail, text })
      }
      await get().fetchMessages(recipientEmail)
      await get().fetchConversations()
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }
}))

export default useChatStore
