import { useState, useRef, useEffect } from 'react'
import { Send, User, X, Minimize2, Maximize2, Bot, Paperclip, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './common/Button'
import useAuthStore from '../store/useAuthStore'
import useChatStore from '../store/useChatStore'
import toast from 'react-hot-toast'

export function ChatWindow({ recipient = 'Support', onClose }) {
  const { user } = useAuthStore()

  const { getMessages, fetchMessages, sendMessage } = useChatStore()
  const SUPPORT_KEY = 'support@shopvirsa'
  const messages = getMessages(SUPPORT_KEY)

  const [input, setInput] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 100 * 1024 * 1024) {
      toast.error('File size must be less than 100MB')
      return
    }
    setAttachment(file)
  }

  // Fetch messages if not minimized
  useEffect(() => {
    if (!isMinimized) {
      fetchMessages(SUPPORT_KEY)
    }
  }, [isMinimized, fetchMessages, SUPPORT_KEY])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text && !attachment) return
    
    setIsSending(true)
    try {
      await sendMessage(SUPPORT_KEY, text, attachment)
      setInput('')
      setAttachment(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 100, scale: 0.9 }}
      className={`fixed bottom-6 right-6 z-[100] w-80 lg:w-96 glass-card rounded-2xl flex flex-col shadow-2xl border-primary/20 ${
        isMinimized ? 'h-16' : 'h-[500px]'
      } transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-4 border-b border-dark-border flex items-center justify-between bg-primary/5 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-dark-card rounded-full" />
          </div>
          <div>
            <div className="font-bold text-sm">{recipient}</div>
            <div className="text-[10px] text-green-500 uppercase font-bold tracking-widest">Online</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded-lg">
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Section */}
          <div 
            ref={scrollRef}
            className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-hide bg-dark-bg/10"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 gap-3 py-8">
                <Bot className="w-8 h-8 text-primary/50" />
                <div>
                  <p className="text-sm font-medium text-slate-400">Start a conversation</p>
                  <p className="text-xs mt-1">Send a message and our support team will reply shortly.</p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                if (!msg) return null;
                const isMe = msg.sender === 'user' || msg.sender === 'customer'
                const isBot = msg.sender === 'bot'
                
                return (
                  <div 
                    key={msg.id || index} 
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {!isMe && (
                      <span className="text-[9px] text-slate-500 mb-1 flex items-center gap-1">
                        {isBot ? <Bot className="w-2.5 h-2.5 text-primary" /> : <User className="w-2.5 h-2.5" />}
                        {isBot ? 'Bot' : 'Support Agent'}
                      </span>
                    )}
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      isMe 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : isBot
                          ? 'bg-dark-card border border-dark-border text-slate-300 rounded-tl-none font-medium italic'
                          : 'bg-dark-card border border-dark-border text-white rounded-tl-none'
                    }`}>
                      {msg.attachmentUrl && (
                        <div className="mb-2">
                          {msg.attachmentUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                            <img src={msg.attachmentUrl} alt="attachment" className="rounded-lg max-w-full max-h-48 object-cover" />
                          ) : (
                            <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors text-xs break-all">
                              <FileText className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{msg.attachmentName || 'Download Attachment'}</span>
                            </a>
                          )}
                        </div>
                      )}
                      {msg.text || msg.body || msg.message}
                    </div>
                    <span className="text-[9px] text-slate-600 mt-1">
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : msg.time || ''}
                    </span>
                  </div>
                )
              })
            )}
          </div>

          {/* Input Section */}
          <div className="border-t border-dark-border bg-dark-bg/50">
            {attachment && (
              <div className="px-4 pt-3 flex items-center gap-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 bg-dark-card border border-dark-border px-3 py-1.5 rounded-lg max-w-[200px]">
                  <FileText className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate flex-grow">{attachment.name}</span>
                  <button type="button" onClick={() => setAttachment(null)} className="hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
            <form onSubmit={handleSend} className="p-4 flex gap-2 items-center">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                title="Attach file (max 100MB)"
                disabled={isSending}
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isSending}
                className="flex-grow bg-dark-bg border border-dark-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-white disabled:opacity-50"
              />
              <Button type="submit" size="sm" className="w-10 h-10 p-0 rounded-xl" disabled={isSending || (!input.trim() && !attachment)}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </>
      )}
    </motion.div>
  )
}
