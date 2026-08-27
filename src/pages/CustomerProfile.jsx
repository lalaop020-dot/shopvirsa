import { useState, useEffect } from 'react'
import { User, Lock, Package, ShoppingBag, CheckCircle2, Clock, Truck, XCircle, ChevronRight, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import useAuthStore from '../store/useAuthStore'
import useOrderStore from '../store/useOrderStore'
import api from '../api/axios'
import { formatCurrency, formatDate } from '../utils/formatters'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'security', label: 'Security', icon: Lock },
]

const STATUS_CONFIG = {
  processing:  { icon: Clock,         color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',   label: 'Processing' },
  dispatched:  { icon: Truck,         color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20',  label: 'Dispatched' },
  shipped:     { icon: Truck,         color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20',  label: 'Shipped' },
  delivered:   { icon: CheckCircle2,  color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20',  label: 'Delivered' },
  completed:   { icon: CheckCircle2,  color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20',  label: 'Completed' },
  cancelled:   { icon: XCircle,       color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20',      label: 'Cancelled' },
}

function getStatusConfig(status) {
  return STATUS_CONFIG[status?.toLowerCase()] || { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', label: status || 'Unknown' }
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = getStatusConfig(order.status)
  const StatusIcon = cfg.icon

  const orderId = order.id ? `#ORD-${String(order.id).padStart(6, '0').toUpperCase()}` : `#${order.id}`
  const total = parseFloat(order.total || 0)
  const items = order.items || []
  const date = order.createdAt || order.created_at

  return (
    <motion.div
      layout
      className="bg-dark-bg border border-dark-border rounded-xl overflow-hidden"
    >
      {/* Order Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between p-4 hover:bg-dark-card/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-white">{orderId}</div>
            <div className="text-xs text-slate-500">{date ? formatDate(date) : '—'}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
            <StatusIcon className="w-3 h-3" />
            {cfg.label}
          </span>
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-white">{formatCurrency(total)}</div>
            <div className="text-xs text-slate-500">{items.length} item{items.length !== 1 ? 's' : ''}</div>
          </div>
          <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {/* Order Items (expanded) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-dark-border p-4 space-y-3">
              {items.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-dark-card rounded-lg">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{item.name || 'Product'}</div>
                          <div className="text-xs text-slate-500">Qty: {item.quantity || 1}</div>
                        </div>
                        <div className="text-sm font-bold text-primary flex-shrink-0">
                          {formatCurrency(parseFloat(item.price || 0) * (item.quantity || 1))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Shipping info */}
                  {(order.shippingAddress || order.shipping_address) && (
                    <div className="pt-2 border-t border-dark-border">
                      <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Shipping To</div>
                      <div className="text-sm text-slate-300">
                        {(order.shippingAddress || order.shipping_address)?.name}
                        {(order.shippingAddress || order.shipping_address)?.address && (
                          <span className="text-slate-500"> · {(order.shippingAddress || order.shipping_address).address}, {(order.shippingAddress || order.shipping_address).city}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Total row */}
                  <div className="flex justify-between pt-2 border-t border-dark-border">
                    <span className="text-sm text-slate-400">Order Total</span>
                    <span className="text-sm font-bold text-white">{formatCurrency(total)}</span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500 text-center py-2">No item details available.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function CustomerProfile() {
  const { user } = useAuthStore()
  const orders = useOrderStore((state) => state.orders) || []
  const fetchCustomerOrders = useOrderStore((state) => state.fetchCustomerOrders)
  const isLoadingOrders = useOrderStore((state) => state.isLoading)

  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    return ['profile', 'orders', 'security'].includes(tab) ? tab : 'profile'
  })
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  useEffect(() => {
    fetchCustomerOrders()
  }, [fetchCustomerOrders])

  const totalOrders = orders.length
  const activeOrdersCount = orders.filter(o => {
    const status = String(o.status || '').toLowerCase()
    return status !== 'delivered' && status !== 'cancelled' && status !== 'completed'
  }).length
  const completedOrdersCount = orders.filter(o => {
    const status = String(o.status || '').toLowerCase()
    return status === 'delivered' || status === 'completed'
  }).length

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setIsSavingProfile(true)
    try {
      await api.put('/auth/profile', { name, email })
      await useAuthStore.getState().fetchMe()
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setIsSavingPassword(true)
    try {
      await api.put('/auth/password', { currentPassword, newPassword })
      toast.success('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update password')
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in py-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">My Account</h1>
        <p className="text-slate-400 text-sm">Manage your profile, orders, and security settings.</p>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* ── Sidebar ─────────────────────────────────────── */}
        <aside className="space-y-4">
          {/* Avatar Card */}
          <Card className="flex flex-col items-center text-center p-6 space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center font-bold text-3xl text-white shadow-lg shadow-primary/20">
              {user?.name?.[0]?.toUpperCase() || 'C'}
            </div>
            <div>
              <h3 className="font-bold text-lg">{user?.name || 'Customer User'}</h3>
              <p className="text-xs text-slate-500 truncate max-w-[180px] mx-auto">{user?.email || ''}</p>
            </div>

            {/* Stats */}
            <div className="w-full border-t border-dark-border pt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="font-bold text-primary text-lg">{totalOrders}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Orders</div>
              </div>
              <div>
                <div className="font-bold text-amber-400 text-lg">{activeOrdersCount}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Active</div>
              </div>
              <div>
                <div className="font-bold text-green-400 text-lg">{completedOrdersCount}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Done</div>
              </div>
            </div>
          </Card>

          {/* Tab Navigation */}
          <Card className="p-2 space-y-1">
            {TABS.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'text-slate-400 hover:bg-dark-bg hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {tab.label}
                  {tab.id === 'orders' && totalOrders > 0 && (
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${
                      activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-primary/20 text-primary'
                    }`}>
                      {totalOrders}
                    </span>
                  )}
                </button>
              )
            })}
          </Card>
        </aside>

        {/* ── Main Content ─────────────────────────────────── */}
        <div>
          <AnimatePresence mode="wait">
            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="space-y-6">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" /> Profile Settings
                  </h3>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button type="submit" disabled={isSavingProfile}>
                        {isSavingProfile ? 'Saving…' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}

            {/* ── Orders Tab ── */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" /> Order History
                  </h3>
                  <span className="text-sm text-slate-400">{totalOrders} total</span>
                </div>

                {isLoadingOrders ? (
                  <div className="py-16 flex flex-col items-center gap-3 text-slate-500">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm">Loading your orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <Card className="py-16 flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 bg-dark-bg border border-dark-border rounded-2xl flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">No Orders Yet</h4>
                      <p className="text-sm text-slate-500 max-w-xs mx-auto">
                        You haven't placed any orders. Start shopping to see your order history here.
                      </p>
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Security Tab ── */}
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="space-y-6">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" /> Change Password
                  </h3>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="New Password"
                        type="password"
                        placeholder="Min. 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <Input
                        label="Confirm New Password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    {/* Password strength hint */}
                    {newPassword.length > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`h-1 flex-1 rounded-full ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={newPassword.length >= 8 ? 'text-green-400' : 'text-red-400'}>
                          {newPassword.length >= 8 ? 'Strong enough' : 'Too short (min. 8 chars)'}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <Button type="submit" disabled={isSavingPassword}>
                        {isSavingPassword ? 'Updating…' : 'Update Password'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
