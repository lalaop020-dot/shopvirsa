import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Star, ShieldCheck, Search, ChevronLeft, ChevronRight,
  ShoppingCart, TrendingUp, Package, Layers, Eye, LogIn,
  Smartphone, Dumbbell, Sparkles, Shirt, Home as HomeIcon, PawPrint,
  ShoppingBag, Laptop, Headphones, Gamepad, Puzzle, Zap, Tag, Flame
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { ProductCard } from '../components/ProductCard'
import { Pagination } from '../components/common/Pagination'
import { useProductStore } from '../store/useProductStore'
import useAuthStore from '../store/useAuthStore'
import { AlertCircle, RefreshCw } from 'lucide-react'

// ─── Category config ──────────────────────────────────────────────────────────
const FEATURED_CATEGORIES = [
  { name: 'Electronics',                          icon: Smartphone,  color: 'text-blue-400',    bg: 'from-blue-500/20 to-blue-600/10',    slug: 'electronics' },
  { name: 'Sports Goods',                         icon: Dumbbell,    color: 'text-orange-400',  bg: 'from-orange-500/20 to-orange-600/10', slug: 'sports goods' },
  { name: 'Cosmetics',                            icon: Sparkles,    color: 'text-pink-400',    bg: 'from-pink-500/20 to-pink-600/10',    slug: 'cosmetics' },
  { name: "Men's Clothes & Outfits",              icon: Shirt,       color: 'text-indigo-400',  bg: 'from-indigo-500/20 to-indigo-600/10',slug: "men's clothes & outfits" },
  { name: "Women's Clothes & Outfits",            icon: ShoppingBag, color: 'text-rose-400',    bg: 'from-rose-500/20 to-rose-600/10',    slug: "women's clothes & outfits" },
  { name: 'Home Appliances',                      icon: HomeIcon,    color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-600/10', slug: 'home appliances and goods accessories' },
  { name: 'Pet Food & Accessories',               icon: PawPrint,    color: 'text-amber-400',   bg: 'from-amber-500/20 to-amber-600/10',  slug: 'pet food and accessories' },
  { name: 'Toys & Games',                         icon: Puzzle,      color: 'text-yellow-400',  bg: 'from-yellow-500/20 to-yellow-600/10',slug: 'toys & games' },
]

export default function Home() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const storeroomProducts = useProductStore((state) => state.storeroomProducts) || []
  const fetchStoreroomProducts = useProductStore((state) => state.fetchStoreroomProducts)
  const isLoading = useProductStore((state) => state.storeroomLoading)
  const fetchError = useProductStore((state) => state.storeroomError)
  const categories = useProductStore((state) => state.categories) || []
  const categoryScrollRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchStoreroomProducts()
    }
  }, [isAuthenticated, fetchStoreroomProducts])

  const activeProducts = storeroomProducts

  // Active category filter on homepage
  const [activeCategory, setActiveCategory] = useState('All')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeCategory])

  // Featured products (top 5 by stock)
  const featuredProducts = [...activeProducts].sort((a, b) => b.stock - a.stock).slice(0, 5)

  // Auto-cycle carousel
  useEffect(() => {
    if (featuredProducts.length === 0) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredProducts.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [featuredProducts.length])

  // Live search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults((prev) => (prev.length === 0 ? prev : []))
      return
    }
    const q = searchQuery.toLowerCase()
    const results = activeProducts
      .filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, 5)
    setSearchResults(results)
  }, [searchQuery, activeProducts])

  const totalProducts = activeProducts.length
  const totalStock = activeProducts.reduce((sum, p) => sum + (p.stock || 0), 0)
  const currentProduct = featuredProducts[currentIndex]

  // Products filtered by active category
  const filteredProducts = activeCategory === 'All'
    ? activeProducts
    : activeProducts.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase())

  const ITEMS_PER_PAGE = 24
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1
  const displayedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const categoryPills = [
    { label: 'All', value: 'All' },
    ...FEATURED_CATEGORIES.map((c) => ({ label: c.name, value: c.name })),
  ]

  const scrollCats = (dir) => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' })
    }
  }

  return (
    <div className="space-y-8 sm:space-y-10">

      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section className="relative py-6 sm:py-10 lg:py-16 overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-widest">
              <Flame className="w-3.5 h-3.5" /> Premium Marketplace
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4 text-white">
              Shop Smarter with{' '}
              <span className="text-primary">Shopvirsa</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mb-6 max-w-lg leading-relaxed">
              Premium products from verified sellers. Lightning-fast delivery, secure checkout, and an incredible selection — all in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products">
                <Button size="lg" className="px-6 sm:px-8 shadow-lg shadow-primary/25">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline">Explore Categories</Button>
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-6 border-t border-dark-border pt-6">
              <div>
                <div className="text-xl font-bold">{totalProducts}</div>
                <div className="text-xs text-slate-500">Products</div>
              </div>
              <div>
                <div className="text-xl font-bold">{FEATURED_CATEGORIES.length}</div>
                <div className="text-xs text-slate-500">Categories</div>
              </div>
              <div>
                <div className="text-xl font-bold">{totalStock.toLocaleString()}+</div>
                <div className="text-xs text-slate-500">In Stock</div>
              </div>
              <div>
                <div className="text-xl font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                </div>
                <div className="text-xs text-slate-500">Secure</div>
              </div>
            </div>
          </motion.div>

          {/* Live Product Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-primary/10 via-dark-card to-secondary/10 rounded-2xl overflow-hidden shadow-2xl border border-dark-border">
              {!isAuthenticated ? (
                <div className="p-10 flex flex-col items-center text-center gap-4">
                  <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center">
                    <LogIn className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Sign in to see live products</h3>
                    <p className="text-sm text-slate-400">Log in to browse the marketplace, view stock, and start shopping.</p>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <Link to="/login"><Button size="sm">Login</Button></Link>
                    <Link to="/register"><Button size="sm" variant="outline">Create Account</Button></Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* Showcase Header */}
                  <div className="p-4 pb-3 border-b border-dark-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">Featured Products</span>
                      </div>
                      <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full font-bold animate-pulse">LIVE</span>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Quick search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                        className="w-full bg-dark-bg/80 border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                      />
                      <AnimatePresence>
                        {isSearchFocused && searchResults.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute z-50 top-full mt-2 w-full bg-dark-card border border-dark-border rounded-xl shadow-2xl overflow-hidden"
                          >
                            {searchResults.map((product) => (
                              <Link
                                to={`/product/${product.globalId || product.id}`}
                                key={product.id}
                                className="flex items-center gap-3 p-3 hover:bg-primary/10 transition-colors cursor-pointer border-b border-dark-border/30 last:border-0"
                              >
                                <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-white truncate">{product.name}</div>
                                  <div className="text-xs text-slate-500">{product.category}</div>
                                </div>
                                <div className="text-sm font-bold text-primary">${product.price}</div>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Product Carousel */}
                  {currentProduct && (
                    <div className="p-4">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentProduct.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.35 }}
                          className="flex gap-4"
                        >
                          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                            <img src={currentProduct.image} alt={currentProduct.name} className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              #{currentIndex + 1}
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">{currentProduct.category}</div>
                              <h3 className="text-base font-bold text-white mb-1 line-clamp-2">{currentProduct.name}</h3>
                              <p className="text-xs text-slate-400 line-clamp-2">{currentProduct.description || 'Premium quality product.'}</p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div>
                                <div className="text-xl font-bold text-white">${currentProduct.price}</div>
                                <div className="text-[10px] text-slate-500">{currentProduct.stock > 0 ? `${currentProduct.stock} in stock` : 'Out of stock'}</div>
                              </div>
                              <Link to={`/product/${currentProduct.globalId || currentProduct.id}`}>
                                <Button size="sm" className="gap-1.5 text-xs">
                                  <Eye className="w-3.5 h-3.5" /> View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>

                      {/* Carousel dots */}
                      <div className="flex items-center justify-center gap-2 mt-4">
                        <button onClick={() => setCurrentIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length)}
                          className="p-1 text-slate-500 hover:text-white transition-colors">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        {featuredProducts.map((_, i) => (
                          <button key={i} onClick={() => setCurrentIndex(i)}
                            className={`rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-primary w-5 h-1.5' : 'bg-slate-600 hover:bg-slate-400 w-1.5 h-1.5'}`}
                          />
                        ))}
                        <button onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredProducts.length)}
                          className="p-1 text-slate-500 hover:text-white transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 border-t border-dark-border/50">
                    <div className="p-3 text-center border-r border-dark-border/50">
                      <Package className="w-4 h-4 mx-auto text-primary mb-1" />
                      <div className="text-xs font-bold">{totalProducts}</div>
                      <div className="text-[10px] text-slate-500">Products</div>
                    </div>
                    <div className="p-3 text-center border-r border-dark-border/50">
                      <Layers className="w-4 h-4 mx-auto text-secondary mb-1" />
                      <div className="text-xs font-bold">{FEATURED_CATEGORIES.length}</div>
                      <div className="text-[10px] text-slate-500">Categories</div>
                    </div>
                    <div className="p-3 text-center">
                      <ShieldCheck className="w-4 h-4 mx-auto text-green-500 mb-1" />
                      <div className="text-xs font-bold">Verified</div>
                      <div className="text-[10px] text-slate-500">Secure</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Floating badge */}
            {isAuthenticated && (
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3.5 }}
                className="absolute -bottom-4 -left-4 glass-card p-2.5 rounded-xl flex items-center gap-2.5 shadow-2xl border border-dark-border/50"
              >
                <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center">
                  <ShoppingCart className="text-primary w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">{totalStock.toLocaleString()}+ Items</div>
                  <div className="text-[10px] text-slate-400">Ready to Ship</div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Category Grid ─────────────────────────────────────────── */}
      {isAuthenticated && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" /> Shop by Category
            </h2>
            <Link to="/products">
              <Button variant="ghost" size="sm" className="text-sm gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2 sm:gap-3">
            {FEATURED_CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const count = activeProducts.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length
              return (
                <Link
                  to={`/category/${cat.slug}`}
                  key={cat.name}
                  className="group flex flex-col items-center gap-1.5 p-2 sm:p-3 rounded-xl border border-dark-border bg-dark-card hover:border-primary/40 hover:bg-dark-card/80 transition-all duration-200 text-center cursor-pointer"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${cat.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${cat.color}`} />
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-300 group-hover:text-white transition-colors leading-tight line-clamp-2">
                    {cat.name}
                  </span>
                  <span className="text-[9px] text-slate-600 bg-dark-bg px-1.5 py-0.5 rounded-full">{count}</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Product Section ────────────────────────────────────────── */}
      {isAuthenticated && (
        <section>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" /> Today's Products
            </h2>
            <Link to="/products">
              <Button variant="ghost" size="sm" className="text-sm gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Category Filter Pills */}
          <div className="relative mb-5">
            <button
              onClick={() => scrollCats(-1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-dark-bg border border-dark-border rounded-full shadow-md hidden sm:flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>
            <div
              ref={categoryScrollRef}
              className="flex gap-2 overflow-x-auto no-scrollbar px-0 sm:px-7"
            >
              {categoryPills.map((pill) => (
                <button
                  key={pill.value}
                  onClick={() => setActiveCategory(pill.value)}
                  className={`flex-shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 border whitespace-nowrap ${
                    activeCategory === pill.value
                      ? 'bg-primary text-white border-primary shadow-md shadow-primary/25'
                      : 'bg-dark-card text-slate-400 border-dark-border hover:border-primary/40 hover:text-white'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => scrollCats(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-dark-bg border border-dark-border rounded-full shadow-md hidden sm:flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-dark-card border border-dark-border rounded-xl overflow-hidden animate-pulse h-[280px]">
                  <div className="h-[140px] bg-dark-bg" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-dark-bg rounded w-1/3" />
                    <div className="h-4 bg-dark-bg rounded w-4/5" />
                    <div className="h-4 bg-dark-bg rounded w-3/5" />
                    <div className="h-8 bg-dark-bg rounded mt-3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!isLoading && fetchError && (
            <div className="text-center py-16 bg-dark-card border border-red-500/20 rounded-2xl px-6">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Failed to load products</h3>
              <p className="text-slate-400 text-sm mb-6">{fetchError}</p>
              <Button onClick={() => fetchStoreroomProducts()} className="gap-2">
                <RefreshCw className="w-4 h-4" /> Try Again
              </Button>
            </div>
          )}

          {/* Product Grid */}
          {!isLoading && !fetchError && activeProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} showCartAction={true} />
                ))}
              </div>

              {filteredProducts.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredProducts.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={(page) => {
                    setCurrentPage(page)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="mt-6"
                />
              )}

              {displayedProducts.length === 0 && (
                <div className="text-center py-16 bg-dark-card border border-dark-border rounded-2xl text-slate-500">
                  No products found in this category.
                </div>
              )}
            </>
          ) : !isLoading && !fetchError ? (
            <div className="text-center py-16 bg-dark-card border border-dark-border rounded-2xl text-slate-500">
              No products available right now. Check back soon.
            </div>
          ) : null}
        </section>
      )}

      {/* ── Not Authenticated CTA ─────────────────────────────────── */}
      {!isAuthenticated && (
        <section className="text-center py-16 border border-dark-border rounded-3xl bg-dark-card/40 px-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Unlock the Full Marketplace</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-6 text-sm">
            Create an account or log in to browse our full range of categories, products, and exclusive deals.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/login"><Button size="lg">Login</Button></Link>
            <Link to="/register"><Button size="lg" variant="outline">Create Account</Button></Link>
          </div>
        </section>
      )}
    </div>
  )
}
