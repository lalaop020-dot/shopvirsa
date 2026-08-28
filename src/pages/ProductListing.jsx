import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Search, Filter, LayoutGrid, List, ChevronDown, ShoppingBag, X, SlidersHorizontal, LogIn, AlertCircle, RefreshCw } from 'lucide-react'
import { ProductCard } from '../components/ProductCard'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { Pagination } from '../components/common/Pagination'
import { useProductStore } from '../store/useProductStore'
import useAuthStore from '../store/useAuthStore'

export default function ProductListing() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [view, setView] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const fetchStoreroomProducts = useProductStore((state) => state.fetchStoreroomProducts)
  const storeroomProducts = useProductStore((state) => state.storeroomProducts) || []
  const activeProducts = storeroomProducts
  const categories = useProductStore((state) => state.categories) || []
  
  const isLoading = useProductStore((state) => state.storeroomLoading)
  const fetchError = useProductStore((state) => state.storeroomError)
  const fetchCategories = useProductStore((state) => state.fetchCategories)

  useEffect(() => {
    fetchStoreroomProducts()
    fetchCategories()
  }, [fetchStoreroomProducts, fetchCategories])

  const featuredCategories = [
    'Electronics',
    'Sports Goods',
    'Cosmetics',
    "Men's Clothes & Outfits",
    "Women's Clothes & Outfits",
    'Home Appliances and Goods accessories',
    'Pet Food and accessories',
    'Toys & Games'
  ]

  const getCategoryCount = (catName) => {
    if (catName === 'All') return activeProducts.length
    return activeProducts.filter((p) => p.category.toLowerCase() === catName.toLowerCase()).length
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [slug, searchTerm])

  const filteredProducts = activeProducts.filter((product) => {
    const matchesCategory = !slug || slug === 'all' || product.category.toLowerCase() === slug.toLowerCase()
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const ITEMS_PER_PAGE = 24
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const categoryList = Array.from(new Set(['All', ...featuredCategories, ...categories]))

  const categoryBrands = {
    'electronics': ['Apple', 'Samsung', 'Sony', 'LG', 'Logitech'],
    'sports goods': ['Nike', 'Adidas', 'Puma', 'Under Armour', 'Reebok'],
    'cosmetics': ["L'Oreal", 'MAC', 'Estee Lauder', 'Maybelline', 'NARS'],
    "men's clothes & outfits": ["Levi's", 'Zara', 'H&M', 'Gucci', 'Ralph Lauren'],
    "women's clothes & outfits": ['Zara', 'H&M', 'Chanel', 'Prada', 'Mango'],
    'home appliances and goods accessories': ['Dyson', 'Philips', 'Bosch', 'Panasonic', 'Whirlpool'],
    'pet food and accessories': ['Pedigree', 'Royal Canin', 'Purina', 'Whiskas', "Hill's"],
    'toys & games': ['LEGO', 'Hasbro', 'Mattel', 'Fisher-Price', 'Nerf']
  }

  const currentBrands = slug && categoryBrands[slug.toLowerCase()]
    ? categoryBrands[slug.toLowerCase()]
    : ['Apple', 'Samsung', 'Nike', 'Zara', "L'Oreal"]

  // Sidebar filter content — reused in both desktop sidebar and mobile drawer
  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold mb-3 uppercase text-xs tracking-widest text-slate-500">Categories</h3>
        <ul className="space-y-1.5">
          {categoryList.map((c) => {
            const isCatActive = (!slug && c === 'All') || (slug && slug.toLowerCase() === c.toLowerCase())
            return (
              <li
                key={c}
                onClick={() => {
                  navigate(c === 'All' ? '/products' : `/category/${c.toLowerCase()}`)
                  setIsFilterOpen(false)
                }}
                className="flex items-center justify-between group cursor-pointer py-1"
              >
                <span className={`text-sm transition-colors ${isCatActive ? 'text-primary font-bold' : 'text-slate-400 group-hover:text-white'}`}>{c}</span>
                <span className="text-[10px] bg-dark-bg px-2 py-0.5 rounded-full text-slate-500">{getCategoryCount(c)}</span>
              </li>
            )
          })}
        </ul>
      </div>

      <div>
        <h3 className="font-bold mb-3 uppercase text-xs tracking-widest text-slate-500">Price Range</h3>
        <input type="range" className="w-full accent-primary" min="0" max="5000" />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>$0</span>
          <span>$5,000+</span>
        </div>
      </div>

      <div>
        <h3 className="font-bold mb-3 uppercase text-xs tracking-widest text-slate-500">Brand</h3>
        <div className="space-y-2">
          {currentBrands.map((brand) => (
            <label key={brand} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-dark-border bg-dark-bg accent-primary" />
              <span className="text-sm text-slate-400 group-hover:text-white">{brand}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 capitalize flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            {slug ? slug : 'Marketplace'}
          </h1>
          <p className="text-slate-400 text-sm">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile filter button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 border border-dark-border rounded-lg text-sm hover:border-primary/50 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>

          <div className="flex bg-dark-card border border-dark-border rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-primary text-white' : 'text-slate-500 hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-primary text-white' : 'text-slate-500 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button variant="outline" size="sm" className="gap-1.5 text-sm hidden sm:flex">
            Sort by: Popularity <ChevronDown className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block space-y-6 bg-dark-card border border-dark-border rounded-xl p-4 h-fit sticky top-24">
          <FilterPanel />
        </aside>

        {/* Mobile Filter Drawer */}
        {isFilterOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setIsFilterOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-dark-card border-r border-dark-border p-5 overflow-y-auto lg:hidden animate-slide-up">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-lg">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-dark-bg rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterPanel />
            </div>
          </>
        )}

        {/* Product Area */}
        <div className="space-y-4 min-w-0">
          {!isAuthenticated ? (
            <div className="text-center py-20 bg-dark-card border border-dark-border rounded-2xl px-6 space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                <LogIn className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Sign in to Browse the Marketplace</h3>
                <p className="text-slate-400 max-w-md mx-auto text-sm">
                  Log in to see live products, view stock availability, check pricing details, and start shopping.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Link to="/login">
                  <Button>Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline">Create Account</Button>
                </Link>
              </div>
            </div>
          ) : !isLoading && fetchError ? (
            <div className="py-20 text-center bg-dark-card border border-red-500/20 rounded-3xl px-6 space-y-6 shadow-2xl">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Failed to Load Products</h3>
                <p className="text-slate-400 max-w-md mx-auto">{fetchError}</p>
              </div>
              <button
                onClick={() => fetchStoreroomProducts()}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105"
              >
                <RefreshCw className="w-5 h-5" /> Try Again
              </button>
            </div>
          ) : isLoading ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-400 text-sm">Loading products...</p>
            </div>
          ) : (
            <>
              {/* Search */}
              <div className="relative">
                <Input
                  placeholder="Search in this category..."
                  className="pl-10 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>

              {/* Grid */}
              <div className={`grid gap-2 sm:gap-3 ${
                view === 'grid'
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                  : 'grid-cols-1'
              }`}>
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showCartAction={true}
                  />
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

              {filteredProducts.length === 0 && (
                <div className="text-center py-20 bg-dark-card border border-dark-border rounded-xl text-slate-500">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                  No products available in this section.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
