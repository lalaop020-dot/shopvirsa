import { useState } from 'react'
import { Bell, ShoppingCart, DollarSign, CheckCircle2, Trash2, CheckSquare } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import toast from 'react-hot-toast'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Order Received', message: 'You have a new order for iPhone 15 Pro.', time: '2 mins ago', type: 'order', icon: ShoppingCart, unread: true },
    { id: 2, title: 'Deposit Approved', message: 'Your deposit of $500.00 has been verified.', time: '1 hour ago', type: 'wallet', icon: DollarSign, unread: true },
    { id: 3, title: 'Welcome to Shopiversa', message: 'Your shop has been approved by the admin.', time: '1 day ago', type: 'info', icon: CheckCircle2, unread: false },
  ])

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })))
    toast.success('All notifications marked as read')
  }

  const clearAll = () => {
    setNotifications([])
    toast.success('Notifications history cleared')
  }

  const deleteOne = (id) => {
    setNotifications(notifications.filter(n => n.id !== id))
    toast.success('Notification removed')
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
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-6 hover:bg-white/5 transition-all flex items-start gap-4 relative ${
                notif.unread ? 'bg-primary/5' : ''
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                notif.unread ? 'bg-primary/20 text-primary' : 'bg-dark-bg text-slate-500'
              }`}>
                <notif.icon className="w-6 h-6" />
              </div>
              <div className="flex-grow">
                <div className="font-bold text-base flex items-center gap-2">
                  {notif.title}
                  {notif.unread && <div className="w-2 h-2 bg-primary rounded-full" />}
                </div>
                <p className="text-sm text-slate-400 mt-1 max-w-2xl">{notif.message}</p>
                <span className="text-xs text-slate-500 mt-2 block">{notif.time}</span>
              </div>
              <button 
                onClick={() => deleteOne(notif.id)}
                className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-all shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {notifications.length === 0 && (
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
