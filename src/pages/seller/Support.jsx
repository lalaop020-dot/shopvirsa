import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, User, Bot, Clock, RefreshCw, Paperclip, FileText, X } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import useChatStore from '../../store/useChatStore'
import useAuthStore from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function Support() {
  const { activeChats, fetchConversations, fetchMessages, conversations, sendMessage } = useChatStore()
  const { user } = useAuthStore()
  
  const [replyText, setReplyText] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
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

  // Dynamically discover the admin email from conversations, or fallback
  const partnerEmail = activeChats.length > 0 
    ? (activeChats[0].partnerEmail || activeChats[0].email) 
    : 'admin@shopvirsa.com'

  useEffect(() => {
    fetchConversations().then(() => setIsLoading(false))
  }, [fetchConversations])

  useEffect(() => {
    if (partnerEmail && !isLoading) {
      fetchMessages(partnerEmail)
    }
  }, [partnerEmail, fetchMessages, isLoading])

  // Polling every 5 seconds
  useEffect(() => {
    if (!partnerEmail) return
    const interval = setInterval(() => {
      fetchConversations()
      fetchMessages(partnerEmail)
    }, 5000)
    return () => clearInterval(interval)
  }, [partnerEmail, fetchConversations, fetchMessages])

  const rawMessages = partnerEmail ? (conversations || {})[partnerEmail] : []
  const currentMessages = Array.isArray(rawMessages) ? rawMessages : []

  const handleSend = async (e) => {
    e.preventDefault()
    if (!replyText.trim() && !attachment) return
    
    setIsSending(true)
    try {
      await sendMessage(partnerEmail, replyText, attachment)
      setReplyText('')
      setAttachment(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [currentMessages])

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
        <p className="text-slate-400">Chat with Shopvirsa administrators directly.</p>
      </div>

      <div className="h-[600px] max-w-4xl mx-auto">
        <Card className="h-full p-0 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-dark-border flex items-center justify-between bg-dark-bg/25">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                A
              </div>
              <div>
                <h4 className="font-bold text-sm">Shopvirsa Support (Admin)</h4>
                <div className="text-[10px] text-green-500 font-medium">Online</div>
              </div>
            </div>
            <button onClick={() => { fetchConversations(); if (partnerEmail) fetchMessages(partnerEmail); }} className="text-slate-400 hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto space-y-4 bg-dark-bg/10">
            {isLoading ? (
              <div className="p-10 text-center text-slate-500 text-sm">Loading chat...</div>
            ) : currentMessages.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm">No messages yet. Send a message to start the conversation!</div>
            ) : (
              currentMessages.map((msg, index) => {
                if (!msg) return null;
                // If we sent it, it's ours.
                const isOurs = msg.sender === user?.email || msg.sender === 'seller' || (!msg.sender?.includes('admin') && msg.sender !== 'bot')
                const isAdmin = !isOurs && msg.sender !== 'bot'
                const isBot = msg.sender === 'bot'
                
                return (
                  <div 
                    key={msg.id || index} 
                    className={`flex ${isOurs ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] rounded-2xl p-4 text-sm relative shadow-md ${
                      isOurs 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : isBot 
                          ? 'bg-dark-card border border-dark-border text-slate-300 rounded-tl-none font-medium italic' 
                          : 'bg-dark-card border border-dark-border text-white rounded-tl-none'
                    }`}>
                      {!isOurs && (
                        <div className="flex items-center gap-1 mb-1 text-[10px] text-slate-500">
                          {isBot ? <Bot className="w-3 h-3 text-primary" /> : <User className="w-3 h-3" />}
                          <span>{isBot ? 'Bot' : 'Admin Support'}</span>
                        </div>
                      )}
                      
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

                      <div>{msg.text || msg.body}</div>
                      <div className="text-[9px] text-slate-500 text-right mt-1.5 opacity-70">
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : msg.time}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Input Form */}
          <div className="border-t border-dark-border bg-dark-bg/25">
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
            <form onSubmit={handleSend} className="p-4 flex gap-3 items-center">
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
                placeholder="Type your message to support..."
                className="input-field flex-grow py-3 disabled:opacity-50"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={isSending}
              />
              <Button type="submit" className="flex items-center justify-center p-3" disabled={isSending || (!replyText.trim() && !attachment)}>
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
