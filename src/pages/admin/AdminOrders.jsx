import { useState, useEffect, useCallback } from 'react'
import {
  Search, Plus, ArrowLeft, Copy, Check, ShoppingBag, Shuffle,
  Package, Truck, CheckCircle2, Clock, XCircle, ChevronDown,
  User, CreditCard, Calendar, Info, DollarSign, Store,
  Trash2, Eye, Filter
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Pagination } from '../../components/common/Pagination'
import useOrderStore from '../../store/useOrderStore'
import usePlatformStore from '../../store/usePlatformStore'
import { platformService } from '../../services/platformService'
import { formatCurrency } from '../../utils/formatters'
import toast from 'react-hot-toast'

// ─── Constants & Helpers ────────────────────────────────────────────────────────
const PAYMENT_METHODS = ['Manual Payment', 'Credit Card', 'Debit Card', 'Crypto', 'Cash on Delivery', 'Bank Transfer']

function getMarginRate(seller) {
  const pkg = seller?.package?.toLowerCase() || seller?.package_name?.toLowerCase() || seller?.packageName?.toLowerCase() || 'silver'
  if (pkg.includes('platinum')) return 0.25
  if (pkg.includes('golden') || pkg.includes('gold')) return 0.20
  return 0.17 // Silver or default
}

const STATUS_STEPS = ['Processing', 'Dispatched', 'Delivered', 'Completed']

const STATUS_COLORS = {
  processing:  'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  dispatched:  'bg-blue-500/10   text-blue-400   border border-blue-500/20',
  delivered:   'bg-green-500/10  text-green-400  border border-green-500/20',
  completed:   'bg-primary/10    text-primary    border border-primary/20',
  cancelled:   'bg-red-500/10    text-red-400    border border-red-500/20',
}


function getStatusStyle(s) {
  return STATUS_COLORS[s?.toLowerCase()] || 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
}

function getStatusIndex(status) {
  const idx = STATUS_STEPS.findIndex(s => s.toLowerCase() === status?.toLowerCase())
  return idx === -1 ? 0 : idx
}

// ─── Order Detail View ────────────────────────────────────────────────────────
function OrderDetailView({ order, onBack, onStatusChange }) {
  const [copied, setCopied] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const updateOrderStatus = useOrderStore(s => s.updateOrderStatus)
  const fetchAllOrders   = useOrderStore(s => s.fetchAllOrders)
  const allSellers       = usePlatformStore(s => s.allSellers)

  const items    = order.items || []
  const total    = parseFloat(order.total || items.reduce((s, i) => s + i.price * i.quantity, 0))
  
  // Find seller to calculate package-based profit
  const firstItemSellerEmail = items[0]?.sellerEmail || order.sellerEmail || order.seller_email
  const seller = allSellers.find(s => 
    s.email === firstItemSellerEmail || 
    s.shopEmail === firstItemSellerEmail || 
    s.shop_email === firstItemSellerEmail
  ) || order.seller
  
  const marginRate = getMarginRate(seller)
  const sellerProfit = total * marginRate
  const storeroomPrice = total - sellerProfit

  const currentStatus = order.status || 'Processing'
  const stepIdx = getStatusIndex(currentStatus)

  const createdAt = order.createdAt || order.created_at
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '—'
  const formattedTime = createdAt
    ? new Date(createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '—'

  const orderId = order.id ? `#ORD-${String(order.id).padStart(6, '0').toUpperCase()}` : `#${order.id}`

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true)
    try {
      const ok = await updateOrderStatus(order.id, newStatus)
      if (ok) {
        toast.success(`Order status updated to ${newStatus}`)
        await fetchAllOrders()
        onStatusChange && onStatusChange(newStatus)
      } else {
        toast.error('Failed to update status')
      }
    } finally {
      setUpdatingStatus(false)
    }
  }

  const statusInfoMessages = {
    processing:  "Your order is being processed. We'll notify you once it has been dispatched.",
    dispatched:  "Order has been dispatched and is on its way to the customer.",
    delivered:   "Order has been successfully delivered to the customer.",
    completed:   "Order is fully completed and payment has been settled.",
    cancelled:   "This order has been cancelled.",
  }

  const stepDates = STATUS_STEPS.map((step, i) => {
    if (i === 0) return formattedDate
    if (i <= stepIdx && i > 0) return formattedDate
    return '—'
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      className="space-y-6"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Order ID</span>
          <div className="flex items-center gap-2 bg-dark-card border border-dark-border px-4 py-2 rounded-xl">
            <span className="font-mono font-bold text-primary text-sm">{orderId}</span>
            <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors">
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Header Cards Row */}
      <Card className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-dark-border">
          {/* Order Date */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Order Date</div>
              <div className="font-semibold text-sm">{formattedDate}</div>
              <div className="text-xs text-slate-400">{formattedTime}</div>
            </div>
          </div>

          {/* Customer */}
          <div className="flex items-start gap-3 pl-6">
            <div className="p-2 bg-blue-500/10 rounded-lg mt-0.5">
              <User className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Customer</div>
              <div className="font-semibold text-sm">{order.shippingAddress?.name || order.shipping_address?.name || order.customer_name || 'N/A'}</div>
              <div className="text-xs text-slate-400 truncate max-w-[120px]">
                {order.shippingAddress?.email || order.shipping_address?.email || order.customer_email || ''}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex items-start gap-3 pl-6">
            <div className="p-2 bg-green-500/10 rounded-lg mt-0.5">
              <CreditCard className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Payment Method</div>
              <div className="font-semibold text-sm">{order.paymentMethod || order.payment_method || 'Credit Card'}</div>
            </div>
          </div>

          {/* Order Status */}
          <div className="flex items-start gap-3 pl-6">
            <div className="p-2 bg-orange-500/10 rounded-lg mt-0.5">
              <Package className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Order Status</div>
              <div className="relative">
                <select
                  value={currentStatus}
                  onChange={e => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className={`text-xs font-bold uppercase px-3 py-1.5 rounded-full cursor-pointer outline-none appearance-none pr-7 ${getStatusStyle(currentStatus)}`}
                >
                  {STATUS_STEPS.map(s => (
                    <option key={s} value={s} className="bg-dark-bg text-white normal-case">
                      {s === 'Processing' ? 'In Processing' : s}
                    </option>
                  ))}
                  <option value="Cancelled" className="bg-dark-bg text-white normal-case">Cancelled</option>
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-2 pointer-events-none text-current" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Delivery Status Tracker */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-6">Delivery Status</h3>
        <div className="relative flex items-start justify-between">
          {/* Connector line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-dark-border" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-700"
            style={{ width: `${(stepIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
          />

          {STATUS_STEPS.map((step, i) => {
            const isCompleted = i < stepIdx
            const isCurrent   = i === stepIdx
            const isPending   = i > stepIdx

            return (
              <div key={step} className="flex flex-col items-center z-10 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted ? 'bg-primary border-primary text-white' :
                  isCurrent   ? 'bg-dark-bg border-primary text-primary' :
                                'bg-dark-bg border-dark-border text-slate-600'
                }`}>
                  {isCompleted ? <Check className="w-5 h-5" /> :
                   isCurrent   ? <Clock className="w-5 h-5 animate-pulse" /> :
                   i === 1     ? <Truck className="w-5 h-5" /> :
                   i === 2     ? <Package className="w-5 h-5" /> :
                                 <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div className={`mt-3 text-sm font-semibold ${isCurrent ? 'text-primary' : isPending ? 'text-slate-600' : 'text-slate-300'}`}>
                  {isCurrent && step === 'Processing' ? 'In Processing' : step}
                </div>
                <div className="text-xs text-slate-500 mt-1">{stepDates[i]}</div>
                {i === 0 && isCurrent && <div className="text-xs text-slate-500">{formattedTime}</div>}
              </div>
            )
          })}
        </div>

        {/* Info Banner */}
        <div className={`mt-6 flex items-start gap-3 p-4 rounded-xl border ${
          currentStatus.toLowerCase() === 'cancelled'
            ? 'bg-red-500/5 border-red-500/20'
            : 'bg-amber-500/5 border-amber-500/20'
        }`}>
          <Info className={`w-4 h-4 mt-0.5 shrink-0 ${currentStatus.toLowerCase() === 'cancelled' ? 'text-red-400' : 'text-amber-400'}`} />
          <p className="text-sm text-slate-300">
            {statusInfoMessages[currentStatus.toLowerCase()] || statusInfoMessages.processing}
          </p>
        </div>
      </Card>

      {/* Ordered Items */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-dark-border">
          <h3 className="text-lg font-bold">Ordered Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-dark-bg text-slate-500 text-xs uppercase tracking-widest">
              <tr>
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Quantity</th>
                <th className="px-6 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-dark-bg/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover bg-dark-bg border border-dark-border"
                      />
                      <div>
                        <div className="font-semibold text-sm text-white">{item.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          SKU: {item.sku || `SKU-${String(item.productId || item.id || idx).toUpperCase().padStart(8, '0')}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-medium">{formatCurrency(item.price)}</td>
                  <td className="px-6 py-4 text-slate-400">{item.quantity}</td>
                  <td className="px-6 py-4 text-right font-bold text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-slate-500">No items in this order</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Order Summary & Earnings */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-6">Order Summary &amp; Earnings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Total + Commission */}
          <div className="space-y-4">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Total Price</div>
              <div className="text-xs text-slate-500 mb-2">Total amount paid by customer</div>
              <div className="text-3xl font-black text-green-400">{formatCurrency(total)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Seller Profit Margin</div>
              <div className="text-xs text-slate-500 mb-2">Based on {seller?.package_name || 'Silver'} package</div>
              <div className="text-3xl font-black text-primary">{Math.round(marginRate * 100)}%</div>
            </div>
          </div>

          {/* Right: Earnings breakdown */}
          <div className="bg-dark-bg rounded-2xl p-6 border border-dark-border space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Storeroom Price</div>
                <div className="text-xs text-slate-500 mb-3">Amount sent to platform/storeroom</div>
                <div className="text-3xl font-black text-white">{formatCurrency(storeroomPrice)}</div>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="pt-4 border-t border-dark-border">
              <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Seller Profit</div>
              <div className="text-xs text-slate-500 mb-2">Seller's earning from this order</div>
              <div className="text-2xl font-black text-orange-400">{formatCurrency(sellerProfit)}</div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ─── Place Order Modal ────────────────────────────────────────────────────────
function PlaceOrderModal({ onClose, onSuccess }) {
  const allSellers   = usePlatformStore(s => s.allSellers)
  const fetchAllSellers = usePlatformStore(s => s.fetchAllSellers)
  const adminPlaceOrder = useOrderStore(s => s.adminPlaceOrder)

  const [step, setStep]               = useState(1) // 1=shop, 2=products, 3=details, 4=review
  const [selectedSeller, setSelectedSeller] = useState(null)
  const [shopProducts, setShopProducts]     = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [currentPage, setCurrentPage]         = useState(1)
  const [cartItems, setCartItems]           = useState([])
  const [submitting, setSubmitting]         = useState(false)

  const [shipping, setShipping] = useState({
    name: '', email: '', address: '', city: '', zip: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('Manual Payment')

  useEffect(() => { fetchAllSellers() }, [fetchAllSellers])

  const loadShopProducts = useCallback(async (seller) => {
    setLoadingProducts(true)
    setShopProducts([])
    try {
      const email = seller?.email || seller?.shopEmail || seller?.shop_email || seller?.owner_email
      const data = await platformService.getSellerShopProducts(email)
      let products = Array.isArray(data) ? data : (data.items || data.products || data.data?.products || data.data || [])
      if (!Array.isArray(products)) products = []
      setShopProducts(products)
    } catch {
      setShopProducts([])
      toast.error('Could not load shop products')
    } finally {
      setLoadingProducts(false)
    }
  }, [])

  const handleSellerSelect = async (seller) => {
    setSelectedSeller(seller)
    setCartItems([])
    setCurrentPage(1)
    await loadShopProducts(seller)
    setStep(2)
  }

  const handleRandomFill = () => {
    if (!shopProducts.length) return toast.error('No products available')
    const count = Math.floor(Math.random() * 3) + 1 // 1–3 random products
    const shuffled = [...shopProducts].sort(() => Math.random() - 0.5)
    const picked = shuffled.slice(0, count).map(p => ({
      ...p,
      quantity: Math.floor(Math.random() * 3) + 1
    }))
    setCartItems(picked)
    toast.success(`Randomly added ${count} product${count > 1 ? 's' : ''} to cart!`)
  }

  const handleAddProduct = (product) => {
    setCartItems(prev => {
      const existing = prev.find(i => (i.id || i._id) === (product.id || product._id))
      if (existing) {
        return prev.map(i =>
          (i.id || i._id) === (product.id || product._id)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const handleRemoveItem = (productId) => {
    setCartItems(prev => prev.filter(i => (i.id || i._id) !== productId))
  }

  const handleQtyChange = (productId, qty) => {
    if (qty < 1) return handleRemoveItem(productId)
    setCartItems(prev => prev.map(i =>
      (i.id || i._id) === productId ? { ...i, quantity: qty } : i
    ))
  }

  const cartTotal = cartItems.reduce((s, i) => s + parseFloat(i.price || 0) * i.quantity, 0)
  const marginRate = getMarginRate(selectedSeller)
  const sellerProfit = cartTotal * marginRate
  const storeroomPrice = cartTotal - sellerProfit

  const handleSubmit = async () => {
    if (!cartItems.length) return toast.error('Cart is empty')
    if (!shipping.name || !shipping.address || !shipping.city) {
      return toast.error('Please complete shipping details')
    }
    setSubmitting(true)
    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.globalId || item.id || item._id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity),
          image: item.image || null,
          category: item.category || null,
          sellerEmail: selectedSeller?.email || selectedSeller?.shopEmail || null,
          sku: item.sku || null,
        })),
        shippingAddress: { ...shipping },
        paymentMethod,
      }
      await adminPlaceOrder(orderData)
      toast.success('Order placed successfully!')
      onSuccess && onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  const STEPS = ['Select Shop', 'Add Products', 'Customer Details', 'Review & Place']

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-card w-full max-w-3xl rounded-2xl relative z-10 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-dark-border shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Place New Order</h2>
              <p className="text-sm text-slate-400 mt-0.5">Create an order from seller shop products</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-dark-bg rounded-lg text-slate-400 hover:text-white transition-all">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          {/* Step Indicator */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
                  i + 1 === step ? 'text-primary' : i + 1 < step ? 'text-green-400' : 'text-slate-600'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                    i + 1 === step ? 'border-primary text-primary bg-primary/10' :
                    i + 1 < step  ? 'border-green-400 text-green-400 bg-green-500/10' :
                                    'border-slate-700 text-slate-600'
                  }`}>
                    {i + 1 < step ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className="hidden sm:block">{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${i + 1 < step ? 'bg-green-400/40' : 'bg-dark-border'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Step 1: Select Seller Shop */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-400 mb-4">Select a seller shop to place an order from:</p>
              {allSellers.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <Store className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <div>No approved sellers found</div>
                </div>
              ) : allSellers.map(seller => (
                <button
                  key={seller.id || seller._id}
                  onClick={() => handleSellerSelect(seller)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-dark-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">
                    {(seller.shopName || seller.shop_name || seller.name || 'S')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold group-hover:text-primary transition-colors">
                      {seller.shopName || seller.shop_name || 'Shop'}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {seller.email || seller.shopEmail || seller.shop_email}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500 -rotate-90 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Browse & Add Products */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">
                    {selectedSeller?.shopName || selectedSeller?.shop_name || 'Shop'} Products
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{shopProducts.length} products available</div>
                </div>
                <Button
                  onClick={handleRandomFill}
                  className="flex items-center gap-2 text-sm"
                  variant="outline"
                >
                  <Shuffle className="w-4 h-4" /> Random Fill
                </Button>
              </div>

              {/* Cart Summary */}
              {cartItems.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <div className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
                    Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}) — {formatCurrency(cartTotal)}
                  </div>
                  <div className="space-y-2">
                    {cartItems.map(item => (
                      <div key={item.id || item._id} className="flex items-center gap-3 text-sm">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80'}
                          className="w-8 h-8 rounded-lg object-cover"
                          alt={item.name}
                        />
                        <span className="flex-1 truncate text-slate-200">{item.name}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleQtyChange(item.id || item._id, item.quantity - 1)}
                            className="w-5 h-5 rounded bg-dark-border hover:bg-primary/20 text-slate-400 hover:text-primary transition-all flex items-center justify-center text-xs font-bold">−</button>
                          <span className="w-6 text-center font-bold">{item.quantity}</span>
                          <button onClick={() => handleQtyChange(item.id || item._id, item.quantity + 1)}
                            className="w-5 h-5 rounded bg-dark-border hover:bg-primary/20 text-slate-400 hover:text-primary transition-all flex items-center justify-center text-xs font-bold">+</button>
                        </div>
                        <span className="text-slate-300 font-bold w-16 text-right">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                        <button onClick={() => handleRemoveItem(item.id || item._id)}
                          className="text-red-400 hover:text-red-300 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product List */}
              {loadingProducts ? (
                <div className="text-center py-10 text-slate-500">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  Loading products...
                </div>
              ) : shopProducts.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <div>No products found in this shop</div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                    {shopProducts.slice((currentPage - 1) * 200, currentPage * 200).map(product => {
                    const inCart = cartItems.find(i => (i.id || i._id) === (product.id || product._id))
                    return (
                      <button
                        key={product.id || product._id}
                        onClick={() => handleAddProduct(product)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          inCart
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-dark-border hover:border-primary/30 hover:bg-dark-bg/50'
                        }`}
                      >
                        <img
                          src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80'}
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                          alt={product.name}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{product.name}</div>
                          <div className="text-xs text-primary font-bold">{formatCurrency(product.price)}</div>
                        </div>
                        {inCart && (
                          <span className="text-xs bg-primary text-white px-1.5 py-0.5 rounded font-bold shrink-0">
                            ×{inCart.quantity}
                          </span>
                        )}
                      </button>
                    )
                  })}
                  </div>
                  {shopProducts.length > 0 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(shopProducts.length / 200) || 1}
                      totalItems={shopProducts.length}
                      itemsPerPage={200}
                      onPageChange={setCurrentPage}
                      className="mt-4"
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 3: Customer / Shipping Details */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">Enter the customer's shipping information:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Customer Name" required value={shipping.name}
                  onChange={e => setShipping(s => ({ ...s, name: e.target.value }))} />
                <Input label="Customer Email" type="email" value={shipping.email}
                  onChange={e => setShipping(s => ({ ...s, email: e.target.value }))} />
              </div>
              <Input label="Shipping Address" required value={shipping.address}
                onChange={e => setShipping(s => ({ ...s, address: e.target.value }))} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" required value={shipping.city}
                  onChange={e => setShipping(s => ({ ...s, city: e.target.value }))} />
                <Input label="ZIP / Postal Code" value={shipping.zip}
                  onChange={e => setShipping(s => ({ ...s, zip: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Payment Method</label>
                <select
                  className="input-field"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                >
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-dark-bg rounded-xl border border-dark-border p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Seller Shop</span>
                  <span className="font-semibold">{selectedSeller?.shopName || selectedSeller?.shop_name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Customer</span>
                  <span className="font-semibold">{shipping.name || '—'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Shipping To</span>
                  <span className="font-semibold">{shipping.city ? `${shipping.address}, ${shipping.city}` : '—'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Payment</span>
                  <span className="font-semibold">{paymentMethod}</span>
                </div>
              </div>

              <div className="bg-dark-bg rounded-xl border border-dark-border p-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  {cartItems.length} Item{cartItems.length !== 1 ? 's' : ''}
                </div>
                {cartItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-dark-border last:border-0">
                    <span className="text-slate-300 truncate flex-1">{item.name} <span className="text-slate-500">×{item.quantity}</span></span>
                    <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 mt-1 text-sm">
                  <span className="text-slate-400 font-medium">Storeroom price</span>
                  <span className="font-semibold text-white">{formatCurrency(storeroomPrice)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 text-sm">
                  <span className="text-slate-500">Seller profit ({Math.round(marginRate * 100)}%)</span>
                  <span className="text-green-400 font-semibold">+{formatCurrency(sellerProfit)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 text-sm border-t border-dark-border mt-2">
                  <span className="text-slate-400 font-bold">Total price</span>
                  <span className="text-xl font-black text-primary">{formatCurrency(cartTotal)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-dark-border shrink-0 flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} className="flex-1">
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              className="flex-1"
              onClick={() => {
                if (step === 2 && cartItems.length === 0) return toast.error('Please add at least one product')
                setStep(s => s + 1)
              }}
              disabled={step === 1 && !selectedSeller}
            >
              Continue
            </Button>
          ) : (
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Placing Order...' : 'Place Order'}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminOrders() {
  const allOrders      = useOrderStore(s => s.allOrders) || []
  const fetchAllOrders = useOrderStore(s => s.fetchAllOrders)
  const selectedOrder  = useOrderStore(s => s.selectedOrder)
  const setSelectedOrder = useOrderStore(s => s.setSelectedOrder)
  const isLoading      = useOrderStore(s => s.isLoading)

  const [searchTerm, setSearchTerm]         = useState('')
  const [statusFilter, setStatusFilter]     = useState('All')
  const [placeModalOpen, setPlaceModalOpen] = useState(false)
  const [detailStatusLocal, setDetailStatusLocal] = useState(null)

  const fetchAllSellers = usePlatformStore(s => s.fetchAllSellers)

  useEffect(() => { 
    fetchAllOrders() 
    fetchAllSellers()
  }, [fetchAllOrders, fetchAllSellers])

  const filteredOrders = allOrders.filter(order => {
    const id       = String(order.id || '').toLowerCase()
    const customer = (order.shippingAddress?.name || order.shipping_address?.name || order.customer_name || '').toLowerCase()
    const status   = (order.status || '').toLowerCase()
    const matchSearch = !searchTerm || id.includes(searchTerm.toLowerCase()) || customer.includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'All' || status === statusFilter.toLowerCase()
    return matchSearch && matchStatus
  })

  const handleViewOrder = (order) => {
    setDetailStatusLocal(order.status)
    setSelectedOrder(order)
  }

  const handleBack = () => setSelectedOrder(null)

  const handleStatusChangedFromDetail = (newStatus) => {
    setDetailStatusLocal(newStatus)
    // Update the order in allOrders locally for immediate feedback
    fetchAllOrders()
  }

  const getStatusLabel = (s) => {
    const m = { processing: 'In Processing', dispatched: 'Dispatched', delivered: 'Delivered', completed: 'Completed', cancelled: 'Cancelled' }
    return m[s?.toLowerCase()] || s || '—'
  }

  const orderStats = {
    total:      allOrders.length,
    processing: allOrders.filter(o => o.status?.toLowerCase() === 'processing').length,
    dispatched: allOrders.filter(o => o.status?.toLowerCase() === 'dispatched').length,
    completed:  allOrders.filter(o => ['delivered', 'completed'].includes(o.status?.toLowerCase())).length,
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <AnimatePresence mode="wait">
        {selectedOrder ? (
          <OrderDetailView
            key="detail"
            order={{ ...selectedOrder, status: detailStatusLocal || selectedOrder.status }}
            onBack={handleBack}
            onStatusChange={handleStatusChangedFromDetail}
          />
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Orders Management</h1>
                <p className="text-slate-400">View all orders and place new orders from seller shops.</p>
              </div>
              <Button
                className="flex items-center gap-2 shrink-0"
                onClick={() => setPlaceModalOpen(true)}
              >
                <Plus className="w-4 h-4" /> Place New Order
              </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Orders',    value: orderStats.total,      color: 'text-white',       bg: 'bg-primary/10',    icon: ShoppingBag },
                { label: 'In Processing',   value: orderStats.processing, color: 'text-orange-400',  bg: 'bg-orange-500/10', icon: Clock },
                { label: 'Dispatched',      value: orderStats.dispatched, color: 'text-blue-400',    bg: 'bg-blue-500/10',   icon: Truck },
                { label: 'Completed',       value: orderStats.completed,  color: 'text-green-400',   bg: 'bg-green-500/10',  icon: CheckCircle2 },
              ].map(({ label, value, color, bg, icon: Icon }) => (
                <Card key={label} className="p-5 flex items-center gap-4">
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <div className={`text-2xl font-black ${color}`}>{value}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Input
                  placeholder="Search by Order ID or Customer name..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500 shrink-0" />
                <select
                  className="input-field text-sm"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  {['All', 'Processing', 'Dispatched', 'Delivered', 'Completed', 'Cancelled'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-dark-bg text-slate-400 text-sm">
                    <tr>
                      <th className="px-6 py-4 font-medium">Order ID</th>
                      <th className="px-6 py-4 font-medium">Customer</th>
                      <th className="px-6 py-4 font-medium">Items</th>
                      <th className="px-6 py-4 font-medium">Total</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border">
                    {filteredOrders.map(order => {
                      const id = `#ORD-${String(order.id || '').padStart(6, '0').toUpperCase()}`
                      const customer = order.shippingAddress?.name || order.shipping_address?.name || order.customer_name || 'N/A'
                      const itemCount = (order.items || []).reduce((s, i) => s + (i.quantity || 1), 0)
                      const total = parseFloat(order.total || 0)
                      const date = (order.createdAt || order.created_at)
                        ? new Date(order.createdAt || order.created_at).toLocaleDateString()
                        : '—'
                      const status = order.status || 'Processing'

                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-dark-bg/50 transition-colors cursor-pointer"
                          onClick={() => handleViewOrder(order)}
                        >
                          <td className="px-6 py-4 font-mono text-sm font-bold text-primary">{id}</td>
                          <td className="px-6 py-4 text-slate-300">{customer}</td>
                          <td className="px-6 py-4 text-slate-400">{itemCount}</td>
                          <td className="px-6 py-4 font-bold">{formatCurrency(total)}</td>
                          <td className="px-6 py-4 text-slate-400 text-sm">{date}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(status)}`}>
                              {getStatusLabel(status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="sm" className="gap-1.5" onClick={e => { e.stopPropagation(); handleViewOrder(order) }}>
                              <Eye className="w-3.5 h-3.5" /> Details
                            </Button>
                          </td>
                        </tr>
                      )
                    })}

                    {isLoading && (
                      <tr>
                        <td colSpan="7" className="text-center py-10 text-slate-500">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          Loading orders...
                        </td>
                      </tr>
                    )}
                    {!isLoading && filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-16">
                          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                          <div className="text-slate-400 font-medium">No orders found</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {searchTerm || statusFilter !== 'All'
                              ? 'Try adjusting your search or filter.'
                              : 'Click "Place New Order" to create the first order.'}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Place Order Modal */}
      <AnimatePresence>
        {placeModalOpen && (
          <PlaceOrderModal
            onClose={() => setPlaceModalOpen(false)}
            onSuccess={() => fetchAllOrders()}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
