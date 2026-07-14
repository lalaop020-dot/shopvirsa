import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Wallet, 
  MessageSquare, 
  Settings, 
  LogOut,
  ChevronLeft,
  Menu,
  Award,
  Store,
  Bell,
  Landmark
} from 'lucide-react'
import { Button } from '../components/common/Button'
import useAuthStore from '../store/useAuthStore'
import { ChatWindow } from '../components/ChatWindow'
import { NotificationCenter } from '../components/NotificationCenter'

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const role = useAuthStore((state) => state.role)
  const user = useAuthStore((state) => state.user)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const sellerMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: `/seller/dashboard` },
    { icon: Package, label: 'My Products', path: `/seller/products` },
    { icon: Store, label: 'Storehouse', path: `/seller/storehouse` },
    { icon: ShoppingCart, label: 'Orders', path: `/seller/orders` },
    { icon: Wallet, label: 'Wallet', path: `/seller/wallet` },
    { icon: Award, label: 'Packages', path: `/seller/packages` },
    { icon: MessageSquare, label: 'Support', path: `/seller/support` },
    { icon: Settings, label: 'Settings', path: `/seller/settings` },
  ]

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: `/admin/dashboard` },
    { icon: Package, label: 'Storeroom Control', path: `/admin/storeroom` },
    { icon: Store, label: 'Shop Approvals', path: `/admin/shops` },
    { icon: Wallet, label: 'Transactions', path: `/admin/transactions` },
    { icon: Landmark, label: 'Bank Withdrawal', path: '/admin/withdrawal' },
    { icon: Award, label: 'Packages', path: `/admin/packages` },
    { icon: MessageSquare, label: 'Support', path: `/admin/support` },
    { icon: Settings, label: 'Settings', path: `/admin/settings` },
  ]

  const menuItems = role === 'admin' ? adminMenuItems : sellerMenuItems

  return (
    <div className="flex min-h-screen bg-dark-bg">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-dark-card border-r border-dark-border transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 flex items-center justify-between">
            {isSidebarOpen && (
              <span className="text-xl font-bold text-primary">{role === 'admin' ? 'ADMIN' : 'SELLER'}</span>
            )}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-dark-bg rounded-lg transition-all"
            >
              {isSidebarOpen ? <ChevronLeft /> : <Menu />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-grow p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-slate-400 hover:bg-dark-bg hover:text-white'
                  }`}
                >
                  <item.icon className="w-6 h-6 flex-shrink-0" />
                  {isSidebarOpen && <span className="font-medium">{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-dark-border">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 p-3 w-full rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-6 h-6 flex-shrink-0" />
              {isSidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-grow transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="sticky top-0 z-40 bg-dark-bg/80 backdrop-blur-lg border-b border-dark-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold capitalize">{location.pathname.split('/').pop() || 'Dashboard'}</h2>
          <div className="flex items-center gap-4">
            <div className="relative mr-2">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`p-2 hover:bg-dark-card rounded-full transition-all text-slate-400 hover:text-white ${isNotifOpen ? 'bg-dark-card text-white' : ''}`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-dark-bg" />
              </button>
              <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold">{user?.name || 'Demo User'}</div>
              <div className="text-xs text-slate-400 uppercase tracking-widest">{role}</div>
            </div>
            <div className="w-10 h-10 bg-primary/20 text-primary rounded-full border border-dark-border flex items-center justify-center font-bold">
              {user?.name?.[0] || 'U'}
            </div>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>

      {/* Floating Chat Toggle */}
      {role !== 'admin' && !isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-50 group"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-dark-bg">1</span>
          
          <div className="absolute right-16 bg-dark-card border border-dark-border px-4 py-2 rounded-xl text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Need help? Chat with us
          </div>
        </button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <ChatWindow 
            recipient="Admin Support" 
            onClose={() => setIsChatOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}
