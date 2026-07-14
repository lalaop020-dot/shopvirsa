import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_CHATS = {}

const useChatStore = create(
  persist(
    (set, get) => ({
      conversations: {},
      botStatus: {}, // true = AI is handling, false = Admin is handling

      getMessages: (email) => {
        const chat = (get().conversations || {})[email]
        if (Array.isArray(chat)) return chat
        return [
          { id: 0, text: 'Hello! I am your AI Support Assistant. How can I help you today?', sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]
      },

      sendMessage: (email, text, senderRole) => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const newMessage = {
          id: Date.now(),
          text,
          sender: senderRole === 'admin' ? 'admin' : 'user',
          time
        }

        set((state) => {
          const safeConversations = state.conversations || {}
          let chatHistory = safeConversations[email]
          if (!Array.isArray(chatHistory)) {
            chatHistory = [
              { id: 0, text: 'Hello! I am your AI Support Assistant. How can I help you today?', sender: 'bot', time }
            ]
          }
          
          // If admin replies, automatically disable bot mode
          let updatedBotStatus = { ...(state.botStatus || {}) }
          if (senderRole === 'admin') {
            updatedBotStatus[email] = false
          } else if (updatedBotStatus[email] === undefined) {
            // Default new chats to bot mode
            updatedBotStatus[email] = true
          }

          return {
            conversations: {
              ...safeConversations,
              [email]: [...chatHistory, newMessage]
            },
            botStatus: updatedBotStatus
          }
        })

        // AI Bot Logic (if it's a user message and bot is active)
        const currentBotStatus = (get().botStatus || {})[email]
        if (senderRole !== 'admin' && currentBotStatus !== false) {
          const lowerText = text.toLowerCase()
          const needsHuman = lowerText.includes('admin') || lowerText.includes('human') || lowerText.includes('agent')

          setTimeout(() => {
            let botReply = "I'm your AI assistant. I can help with basic queries! If you need to speak to a human, just type 'admin' or 'human'."
            
            if (needsHuman) {
              botReply = "I am forwarding your chat to our human support team. An admin will be with you shortly."
              set(state => ({ botStatus: { ...(state.botStatus || {}), [email]: false } }))
            }

            const botMessage = {
              id: Date.now() + 1,
              text: botReply,
              sender: 'bot',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }

            set((state) => {
              const safeConversations = state.conversations || {}
              const currentHistory = safeConversations[email]
              const safeHistory = Array.isArray(currentHistory) ? currentHistory : []
              return {
                conversations: {
                  ...safeConversations,
                  [email]: [...safeHistory, botMessage]
                }
              }
            })
          }, 800)
        }
      },

      getActiveConversations: () => {
        const conversations = get().conversations || {}
        const botStatus = get().botStatus || {}
        return Object.keys(conversations).map(email => {
          const chat = conversations[email]
          const isArray = Array.isArray(chat)
          const lastMsg = isArray ? chat[chat.length - 1] : null
          return {
            email,
            lastMessage: lastMsg ? lastMsg.text : '',
            time: lastMsg ? lastMsg.time : '',
            unreadCount: isArray ? chat.filter(m => m?.sender === 'user').length : 0,
            isBotMode: botStatus[email] !== false // Default to true if undefined
          }
        })
      }
    }),
    {
      name: 'chat-storage-v2',
    }
  )
)

export default useChatStore
