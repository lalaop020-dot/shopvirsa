import { useState } from 'react'
import { ShoppingCart, User, Search, Menu, Bell, X, ChevronDown, Package, Zap } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../common/Button'
import { NotificationCenter } from '../NotificationCenter'
import useAuthStore from '../../store/useAuthStore'
import useCartStore from '../../store/useCartStore'

export function Navbar() {
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const { isAuthenticated, role, user, logout } = useAuthStore()
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0))
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setIsDropdownOpen(false)
    setIsMobileMenuOpen(false)
    navigate('/', { replace: true })
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      {/* ── Announcement Bar ────────────────────────────────────────── */}
      <div className="w-full bg-primary text-white text-center text-xs py-1.5 px-4">
        <p className="truncate sm:whitespace-normal">
          🎉 Free shipping on orders over $50 &nbsp;·&nbsp; 🛡️ Secure checkout &nbsp;·&nbsp; ⚡ Fast delivery
        </p>
      </div>

      {/* ── Main Nav ────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-dark-bg/95 backdrop-blur-lg border-b border-dark-border w-full">
        <div className="w-full px-3 sm:px-4 lg:px-6">

          {/* Primary row */}
          <div className="flex items-center gap-2 sm:gap-3 py-2.5 sm:py-3 w-full min-w-0">

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-card transition-all shrink-0"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="text-white font-bold text-base sm:text-lg">S</span>
              </div>
              <span className="text-base sm:text-lg font-bold tracking-tight hidden sm:block">
                SHOPI<span className="text-primary">VERSA</span>
              </span>
            </Link>

            {/* Desktop search — flex-1 center */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-4 relative">
              <input
                type="text"
                placeholder="Search products, brands and categories..."
                className="w-full bg-dark-card border border-dark-border rounded-full py-2.5 px-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-500"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Button className="absolute right-1 top-1 h-8 rounded-full text-xs px-4" size="sm">Search</Button>
            </div>

            {/* Spacer on mobile to push icons right */}
            <div className="flex-1 lg:hidden" />

            {/* Icon cluster */}
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">

              {/* Mobile search toggle */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="lg:hidden p-2 hover:bg-dark-card rounded-full transition-all"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart */}
              <Link to="/cart" className="relative p-2 hover:bg-dark-card rounded-full transition-all">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Bell */}
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`p-2 hover:bg-dark-card rounded-full transition-all ${isNotifOpen ? 'bg-dark-card' : ''}`}
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-dark-bg" />
                  )}
                </button>
                <NotificationCenter
                  isOpen={isNotifOpen}
                  onClose={() => setIsNotifOpen(false)}
                  isAuthenticated={isAuthenticated}
                  onUnreadCountChange={setUnreadCount}
                />
              </div>

              {/* User / Account */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-1.5 hover:bg-dark-card p-1.5 sm:p-2 rounded-lg transition-all"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden md:block font-medium max-w-[90px] truncate text-sm">{user?.name || 'User'}</span>
                    <ChevronDown className="hidden md:block w-3.5 h-3.5 text-slate-400" />
                  </button>
                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-xl shadow-2xl p-2 z-50 animate-fade-in">
                        <div className="px-4 py-2 border-b border-dark-border/50 mb-1">
                          <div className="text-sm font-semibold truncate">{user?.name}</div>
                          <div className="text-xs text-slate-500 capitalize">{role}</div>
                        </div>
                        {role === 'customer' ? (
                          <Link
                            to="/profile"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-dark-bg rounded-lg text-sm transition-all"
                          >
                            <User className="w-4 h-4" /> My Profile
                          </Link>
                        ) : (
                          <Link
                            to={`/${role}/dashboard`}
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-dark-bg rounded-lg text-sm transition-all"
                          >
                            <Package className="w-4 h-4" /> Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-all mt-1"
                        >
                          <X className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 hover:bg-dark-card p-1.5 sm:p-2 rounded-lg transition-all"
                >
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="hidden md:block font-medium text-sm">Account</span>
                </Link>
              )}

              {/* Become a Seller — desktop only */}
              <Link to="/seller-register" className="hidden xl:block ml-1">
                <Button variant="outline" size="sm" className="text-xs whitespace-nowrap">
                  <Zap className="w-3.5 h-3.5" /> Sell
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile search row */}
          {isMobileSearchOpen && (
            <div className="lg:hidden pb-3 px-1 animate-slide-up">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products, brands..."
                  autoFocus
                  className="w-full bg-dark-card border border-dark-border rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-500"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
            </div>
          )}

          {/* Desktop category nav row */}
          <div className="hidden lg:flex items-center gap-6 border-t border-dark-border/40 py-2 text-sm text-slate-400 overflow-x-auto no-scrollbar">
            <Link to="/products" className="hover:text-primary transition-colors whitespace-nowrap font-medium text-white">All Products</Link>
            <Link to="/category/Electronics" className="hover:text-primary transition-colors whitespace-nowrap">Electronics</Link>
            <Link to="/category/Sports Goods" className="hover:text-primary transition-colors whitespace-nowrap">Sports</Link>
            <Link to="/category/Cosmetics" className="hover:text-primary transition-colors whitespace-nowrap">Cosmetics</Link>
            <Link to="/category/Men's Clothes" className="hover:text-primary transition-colors whitespace-nowrap">Men's Fashion</Link>
            <Link to="/category/Women's Clothes" className="hover:text-primary transition-colors whitespace-nowrap">Women's Fashion</Link>
            <Link to="/category/Home Appliances" className="hover:text-primary transition-colors whitespace-nowrap">Home</Link>
            <Link to="/category/Toys and Games" className="hover:text-primary transition-colors whitespace-nowrap">Toys</Link>
            {!isAuthenticated && (
              <Link to="/seller-register" className="ml-auto text-primary font-semibold hover:underline whitespace-nowrap">Become a Seller →</Link>
            )}
          </div>
        </div>

        {/* ── Mobile Menu Dropdown ─────────────────────────────────── */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={closeMobileMenu}
            />
            <div className="absolute left-0 right-0 top-full z-40 bg-dark-card border-b border-dark-border shadow-2xl lg:hidden animate-slide-up">
              <div className="p-4 space-y-1">
                {isAuthenticated && (
                  <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-dark-bg rounded-xl border border-dark-border">
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{user?.name}</div>
                      <div className="text-xs text-slate-500 capitalize">{role}</div>
                    </div>
                  </div>
                )}

                <div className="text-[10px] uppercase font-bold text-slate-500 px-3 pt-1 pb-1 tracking-widest">Shop</div>
                {[
                  { to: '/products', label: 'All Products' },
                  { to: '/category/Electronics', label: 'Electronics' },
                  { to: '/category/Sports Goods', label: 'Sports Goods' },
                  { to: '/category/Cosmetics', label: 'Cosmetics' },
                  { to: "/category/Men's Clothes", label: "Men's Fashion" },
                  { to: "/category/Women's Clothes", label: "Women's Fashion" },
                  { to: '/category/Home Appliances', label: 'Home Appliances' },
                  { to: '/category/Toys and Games', label: 'Toys & Games' },
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={closeMobileMenu}
                    className="flex items-center px-3 py-2.5 rounded-xl hover:bg-dark-bg transition-all text-sm text-slate-300 hover:text-white"
                  >
                    {label}
                  </Link>
                ))}

                <div className="border-t border-dark-border/50 my-2" />
                <div className="text-[10px] uppercase font-bold text-slate-500 px-3 pt-1 pb-1 tracking-widest">Account</div>

                {isAuthenticated ? (
                  <>
                    {role === 'customer' ? (
                      <Link to="/profile" onClick={closeMobileMenu}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-dark-bg transition-all text-sm text-slate-300 hover:text-white">
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                    ) : (
                      <Link to={`/${role}/dashboard`} onClick={closeMobileMenu}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-dark-bg transition-all text-sm text-slate-300 hover:text-white">
                        <Package className="w-4 h-4" /> Dashboard
                      </Link>
                    )}
                    <button onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-all text-sm text-red-400">
                      <X className="w-4 h-4" /> Logout
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 px-3 py-2">
                    <Link to="/login" onClick={closeMobileMenu} className="flex-1">
                      <Button className="w-full" size="sm">Login</Button>
                    </Link>
                    <Link to="/register" onClick={closeMobileMenu} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">Register</Button>
                    </Link>
                  </div>
                )}

                <div className="border-t border-dark-border/50 my-2" />
                <Link to="/seller-register" onClick={closeMobileMenu}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-primary/10 transition-all text-sm text-primary font-semibold">
                  <Zap className="w-4 h-4" /> Become a Seller
                </Link>
              </div>
            </div>
          </>
        )}
      </nav>
    </>
  )
}
