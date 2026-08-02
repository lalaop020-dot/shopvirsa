import { useState, useEffect } from 'react'
import { Bell, ShoppingCart, DollarSign, CheckCircle2, Trash2, CheckSquare, Package } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import api from '../api/axios'
import toast from 'react-hot-toast'

const TYPE_ICON_MAP = {
  order: ShoppingCart,
  wallet: DollarSign,
  info: CheckCircle2,
  package: Package,
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      const data = Array.isArray(res.data) ? res.data : (res.data?.items || [])
      setNotifications(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, unread: false })))
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark as read')
    }
  }

  const clearAll = async () => {
    try {
      await api.delete('/notifications/clear')
      setNotifications([])
      toast.success('Notifications history cleared')
    } catch {
      toast.error('Failed to clear notifications')
    }
  }

  const deleteOne = async (id) => {
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n.id !== id))
      toast.success('Notification removed')
    } catch {
      toast.error('Failed to delete notification')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Notifications</h1>
          <p className="text-slate-400 text-sm">Stay updated with activities, orders, and wallet notifications.</p>
        </div>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={markAllRead} className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" /> Mark all read
            </Button>
            <Button variant="danger" size="sm" onClick={clearAll} className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Clear all
            </Button>
          </div>
        )}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="divide-y divide-dark-border">
          {loading && (
            <div className="p-10 text-center text-slate-500">Loading notifications...</div>
          )}
          {!loading && notifications.map((notif) => {
            const isUnread = !notif.is_read && !notif.read
            const NotifIcon = TYPE_ICON_MAP[notif.type] || Bell
            return (
              <div 
                key={notif.id} 
                className={`p-6 hover:bg-white/5 transition-all flex items-start gap-4 relative ${
                  isUnread ? 'bg-primary/5' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isUnread ? 'bg-primary/20 text-primary' : 'bg-dark-bg text-slate-500'
                }`}>
                  <NotifIcon className="w-6 h-6" />
                </div>
                <div className="flex-grow">
                  <div className="font-bold text-base flex items-center gap-2">
                    {notif.title || 'Notification'}
                    {isUnread && <div className="w-2 h-2 bg-primary rounded-full" />}
                  </div>
                  <p className="text-sm text-slate-400 mt-1 max-w-2xl">{notif.message || notif.body}</p>
                  <span className="text-xs text-slate-500 mt-2 block">
                    {notif.created_at ? new Date(notif.created_at).toLocaleString() : notif.time}
                  </span>
                </div>
                <button 
                  onClick={() => deleteOne(notif.id)}
                  className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-all shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })}
          {!loading && notifications.length === 0 && (
            <div className="p-20 text-center text-slate-500 space-y-4">
              <Bell className="w-12 h-12 mx-auto text-slate-600 animate-bounce" />
              <div>You have no notifications at the moment.</div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
