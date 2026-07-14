import { useState } from 'react'
import { Bell, ShoppingCart, DollarSign, UserPlus, Info, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'

export function NotificationCenter({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([])

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-16 right-0 w-80 lg:w-96 glass-card rounded-2xl shadow-2xl z-[101] overflow-hidden"
          >
            <div className="p-4 border-b border-dark-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Notifications</h3>
              </div>
              <button onClick={markAllRead} className="text-xs text-primary hover:underline">Mark all as read</button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 border-b border-dark-border hover:bg-white/5 transition-all cursor-pointer relative ${
                    notif.unread ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      notif.unread ? 'bg-primary/20 text-primary' : 'bg-dark-bg text-slate-500'
                    }`}>
                      <notif.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold flex items-center gap-2">
                        {notif.title}
                        {notif.unread && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{notif.message}</p>
                      <span className="text-[10px] text-slate-500 mt-2 block">{notif.time}</span>
                    </div>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                  No new notifications.
                </div>
              )}
            </div>

            <div className="p-3 bg-dark-bg text-center border-t border-dark-border">
              <Link to="/notifications" onClick={onClose} className="text-xs font-bold text-slate-400 hover:text-white transition-all">
                View All Notifications
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
