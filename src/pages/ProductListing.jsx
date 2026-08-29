import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Search, Filter, LayoutGrid, List, ShoppingBag, X, SlidersHorizontal, LogIn, AlertCircle, RefreshCw } from 'lucide-react'
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
  const backendTotalProducts = useProductStore((state) => state.totalProducts) || 0
  const activeProducts = storeroomProducts
  const categories = useProductStore((state) => state.categories) || []
  
  const isLoading = useProductStore((state) => state.storeroomLoading)
  const fetchError = useProductStore((state) => state.storeroomError)
  const fetchCategories = useProductStore((state) => state.fetchCategories)

  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const ITEMS_PER_PAGE = 24;
const [sortOption, setSortOption] = useState('');
const [priceMax, setPriceMax] = useState(5000);

  useEffect(() => {
    fetchStoreroomProducts({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      category: (!slug || slug.toLowerCase() === 'all') ? undefined : slug,
      search: debouncedSearch || undefined
    })
    fetchCategories()
  }, [fetchStoreroomProducts, fetchCategories, currentPage, slug, debouncedSearch])

  const featuredCategories = [
    "Men's Fashion",
    "Women's Fashion",
    'Electronics',
    'Toys',
    'Cosmetics',
    'Pet Foods',
    'Home Appliances',
    'Sports Goods'
  ]

  const getCategoryCount = (catName) => {
    // Cannot accurately count local items if we only fetch 24 at a time via backend,
    // so we hide or fake counts unless the backend provides them per category.
    return '' 
  }

  useEffect(() => {
    setCurrentPage(1)
    setSortOption('')
  }, [slug, debouncedSearch])

  const totalPages = Math.ceil(backendTotalProducts / ITEMS_PER_PAGE) || 1
  const sortedProducts = [...activeProducts]
  .filter(p => {
    const price = parseFloat(p.price) || 0;
    return price <= priceMax;
  })
  .sort((a, b) => {
    if (sortOption === 'price-asc') return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
    if (sortOption === 'price-desc') return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
    if (sortOption === 'name-asc') return a.name?.localeCompare(b.name);
    if (sortOption === 'name-desc') return b.name?.localeCompare(a.name);
    return 0; // default order (backend)
  });
const paginatedProducts = sortedProducts;

  const categoryList = Array.from(new Set(['All', ...featuredCategories, ...categories]))

  const categoryBrands = {
    'sports goods': ['Nike', 'Adidas', 'Puma', 'Under Armour', 'Reebok'],
    'cosmetics': ["L'Oreal", 'MAC', 'Estee Lauder', 'Maybelline', 'NARS'],
    "men's fashion": ["Levi's", 'Zara', 'H&M', 'Gucci', 'Ralph Lauren'],
    "women's fashion": ['Zara', 'H&M', 'Chanel', 'Prada', 'Mango'],
    'home appliances': ['Dyson', 'Philips', 'Bosch', 'Panasonic', 'Whirlpool'],
    'pet foods': ['Pedigree', 'Royal Canin', 'Purina', 'Whiskas', "Hill's"],
    'toys': ['LEGO', 'Hasbro', 'Mattel', 'Fisher-Price', 'Nerf'],
    'electronics': ['Apple', 'Samsung', 'Sony', 'LG', 'Logitech']
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
        <div className="space-y-2">
  <label className="text-sm font-medium text-slate-400">Max Price ($)</label>
  <input
    type="range"
    className="w-full accent-primary"
    min="0"
    max="5000"
    value={priceMax}
    onChange={e => setPriceMax(Number(e.target.value))}
  />
  <div className="flex justify-between text-xs text-slate-500">
    <span>$0</span>
    <span>${priceMax}</span>
  </div>
</div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>$0</span>
          <span>$5,000+</span>
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
            {backendTotalProducts} product{backendTotalProducts !== 1 ? 's' : ''} available
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

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-dark-card border border-dark-border text-sm text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer hover:border-primary/40 transition-colors"
          >
            <option value="">Sort: Default</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name-asc">Name: A → Z</option>
            <option value="name-desc">Name: Z → A</option>
          </select>
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
          {!isLoading && fetchError ? (
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

              {backendTotalProducts > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={backendTotalProducts}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={(page) => {
                    setCurrentPage(page)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="mt-6"
                />
              )}

              {backendTotalProducts === 0 && (
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
