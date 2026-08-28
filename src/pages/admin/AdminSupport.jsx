import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, User, Bot, Clock, RefreshCw, Paperclip, FileText, X } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import useChatStore from '../../store/useChatStore'
import toast from 'react-hot-toast'

export default function AdminSupport() {
  const { activeChats, fetchConversations, fetchMessages, conversations, sendMessage } = useChatStore()
  
  const [selectedChatEmail, setSelectedChatEmail] = useState(null)
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

  useEffect(() => {
    fetchConversations().then(() => setIsLoading(false))
  }, [fetchConversations])

  useEffect(() => {
    if (selectedChatEmail) {
      fetchMessages(selectedChatEmail)
    }
  }, [selectedChatEmail, fetchMessages])

  // Polling every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations()
      if (selectedChatEmail) {
        fetchMessages(selectedChatEmail)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [fetchConversations, fetchMessages, selectedChatEmail])

  const rawMessages = selectedChatEmail 
    ? (conversations || {})[selectedChatEmail]
    : []
  const currentMessages = Array.isArray(rawMessages) ? rawMessages : []

  const handleSend = async (e) => {
    e.preventDefault()
    if (!replyText.trim() && !attachment) return
    if (!selectedChatEmail) {
      toast.error('Select a conversation first')
      return
    }
    
    setIsSending(true)
    try {
      await sendMessage(selectedChatEmail, replyText, attachment)
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
        <h1 className="text-3xl font-bold mb-2">Support Chat Center</h1>
        <p className="text-slate-400">Respond to customer and seller help queries in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Active Conversations List */}
        <Card className="lg:col-span-1 p-0 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-dark-border flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" /> Active Chats</h3>
            <button onClick={() => fetchConversations()} className="text-slate-400 hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto divide-y divide-dark-border">
            {isLoading ? (
              <div className="p-10 text-center text-slate-500 text-sm">Loading chats...</div>
            ) : activeChats.length === 0 ? (
              <div className="p-10 text-center text-slate-500 text-sm">No active conversations.</div>
            ) : (
              activeChats.map((chat) => (
                <button
                  key={chat.email || chat.partnerEmail}
                  onClick={() => setSelectedChatEmail(chat.email || chat.partnerEmail)}
                  className={`w-full p-4 text-left transition-colors flex items-start gap-3 hover:bg-white/5 ${
                    selectedChatEmail === (chat.email || chat.partnerEmail) ? 'bg-primary/10 border-l-4 border-primary' : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                    {(chat.email || chat.partnerEmail || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs truncate max-w-[120px]">{chat.email || chat.partnerEmail}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> 
                        {chat.updated_at ? new Date(chat.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-1">{chat.lastMessage || chat.last_message || '...'}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Chat Thread Panel */}
        <Card className="lg:col-span-2 p-0 flex flex-col h-full overflow-hidden">
          {selectedChatEmail ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-dark-border flex items-center justify-between bg-dark-bg/25">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    {selectedChatEmail?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{selectedChatEmail}</h4>
                  </div>
                </div>
              </div>

              {/* Messages scrolling list */}
              <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto space-y-4 bg-dark-bg/10">
                {currentMessages.map((msg, index) => {
                  if (!msg) return null;
                  const isAdmin = msg.sender === 'admin'
                  const isBot = msg.sender === 'bot'
                  
                  return (
                    <div 
                      key={msg.id || index} 
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-2xl p-4 text-sm relative shadow-md ${
                        isAdmin 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : isBot 
                            ? 'bg-dark-card border border-dark-border text-slate-300 rounded-tl-none font-medium italic' 
                            : 'bg-dark-card border border-dark-border text-white rounded-tl-none'
                      }`}>
                        {!isAdmin && (
                          <div className="flex items-center gap-1 mb-1 text-[10px] text-slate-500">
                            {isBot ? <Bot className="w-3 h-3 text-primary" /> : <User className="w-3 h-3" />}
                            <span>{isBot ? 'Bot' : 'User'}</span>
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
                        <div className="text-[9px] text-slate-500 text-right mt-1.5">
                          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : msg.time}
                        </div>
                      </div>
                    </div>
                  )
                })}
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
                    placeholder="Type your support reply here..."
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
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-12 text-slate-500 space-y-4">
              <MessageSquare className="w-16 h-16 text-slate-600 animate-pulse" />
              <div className="text-center">
                <h3 className="font-bold text-white text-base">Select a Chat</h3>
                <p className="text-xs text-slate-500 mt-1">Choose a conversation from the left sidebar to view history and start typing replies.</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
