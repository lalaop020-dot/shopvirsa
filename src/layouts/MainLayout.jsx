import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import { Link } from 'react-router-dom'
import {
  ShoppingBag, Mail, Phone, MapPin, Share2, MessageCircle, Camera, Play,
  CreditCard, Shield, Truck, RefreshCw
} from 'lucide-react'

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Trust badges bar */}
      <div className="hidden sm:block bg-dark-card border-b border-dark-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center sm:justify-between gap-4 py-2.5 overflow-x-auto no-scrollbar">
            {[
              { icon: Truck,      label: 'Free Shipping',    sub: 'Orders over $50'    },
              { icon: Shield,     label: 'Secure Checkout',  sub: '256-bit SSL'         },
              { icon: RefreshCw,  label: 'Easy Returns',     sub: '30-day policy'       },
              { icon: CreditCard, label: 'Multiple Payments',sub: 'Cards & wallets'     },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-2.5 shrink-0 px-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{label}</div>
                  <div className="text-[10px] text-slate-500">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-3 sm:px-4 lg:px-6 py-5 sm:py-7 w-full max-w-screen-2xl">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-dark-card border-t border-dark-border mt-auto">
        <div className="container mx-auto px-4 py-10 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {/* Brand column */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
                  <span className="text-white font-bold text-base">S</span>
                </div>
                <span className="text-lg font-bold tracking-tight">
                  SHOPI<span className="text-primary">VERSA</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">
                The world's leading premium multi-vendor marketplace. Shop with confidence from verified sellers worldwide.
              </p>
              <div className="flex items-center gap-3">
                {[Share2, MessageCircle, Camera, Play].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-8 h-8 bg-dark-bg border border-dark-border rounded-lg flex items-center justify-center hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Shop links */}
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-slate-400">Shop</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'All Products', to: '/products' },
                  { label: 'Electronics', to: '/category/Electronics' },
                  { label: 'Fashion', to: "/category/Men's Clothes" },
                  { label: 'Home & Living', to: '/category/Home Appliances' },
                  { label: 'Sports Goods', to: '/category/Sports Goods' },
                ].map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-slate-400 hover:text-primary transition-colors text-sm">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account links */}
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-slate-400">Account</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'My Profile', to: '/profile' },
                  { label: 'My Cart', to: '/cart' },
                  { label: 'Order History', to: '/profile' },
                  { label: 'Seller Dashboard', to: '/seller/dashboard' },
                  { label: 'Become a Seller', to: '/seller-register' },
                ].map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-slate-400 hover:text-primary transition-colors text-sm">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-widest text-slate-400">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-slate-400 text-sm">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>123 Commerce St, Digital City, DC 10001</span>
                </li>
                <li className="flex items-center gap-2.5 text-slate-400 text-sm">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <a href="mailto:support@shopvirsa.com" className="hover:text-primary transition-colors">
                    support@shopvirsa.com
                  </a>
                </li>
                <li className="flex items-center gap-2.5 text-slate-400 text-sm">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <a href="tel:+15551234567" className="hover:text-primary transition-colors">
                    +1 (555) 123-4567
                  </a>
                </li>
              </ul>

              <div className="mt-5 p-3 bg-dark-bg border border-dark-border rounded-xl">
                <div className="text-xs font-semibold mb-1">Newsletter</div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 bg-transparent text-xs border border-dark-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50 placeholder:text-slate-600"
                  />
                  <button className="bg-primary hover:bg-primary-dark text-white text-xs px-3 py-2 rounded-lg transition-colors whitespace-nowrap">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-dark-border">
          <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 text-xs">
            <span>© {new Date().getFullYear()} Shopvirsa. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
