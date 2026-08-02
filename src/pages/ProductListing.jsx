import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Search, Filter, LayoutGrid, List, ChevronDown, ShoppingBag } from 'lucide-react'
import { ProductCard } from '../components/ProductCard'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { useProductStore } from '../store/useProductStore'

export default function ProductListing() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [view, setView] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')

  const activeProducts = useProductStore((state) => state.marketplaceProducts) || []
  const categories = useProductStore((state) => state.categories) || []
  const fetchMarketplaceProducts = useProductStore((state) => state.fetchMarketplaceProducts)
  const fetchCategories = useProductStore((state) => state.fetchCategories)

  useEffect(() => {
    fetchMarketplaceProducts()
    fetchCategories()
  }, [fetchMarketplaceProducts, fetchCategories])

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

  // Compute counts for each category
  const getCategoryCount = (catName) => {
    if (catName === 'All') return activeProducts.length
    return activeProducts.filter(p => p.category.toLowerCase() === catName.toLowerCase()).length
  }

  // Filter products by selected category slug and search term
  const filteredProducts = activeProducts.filter((product) => {
    const matchesCategory = !slug || slug === 'all' || product.category.toLowerCase() === slug.toLowerCase()
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.category.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Combine predefined categories with dynamic ones to ensure they're always visible
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

  return (
    <div className="space-y-8 animate-fade-in py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 capitalize flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-primary" /> {slug ? slug : 'Marketplace'}
          </h1>
          <p className="text-slate-400">Showing {filteredProducts.length} approved system products</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-dark-card border border-dark-border rounded-lg p-1">
            <button 
              onClick={() => setView('grid')}
              className={`p-2 rounded-md ${view === 'grid' ? 'bg-primary text-white' : 'text-slate-500'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-2 rounded-md ${view === 'list' ? 'bg-primary text-white' : 'text-slate-500'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <Button variant="outline" className="gap-2">Sort by: Popularity <ChevronDown className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block space-y-8">
          <div>
            <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-slate-500">Categories</h3>
            <ul className="space-y-2">
              {categoryList.map(c => {
                const isCatActive = (!slug && c === 'All') || (slug && slug.toLowerCase() === c.toLowerCase())
                return (
                  <li 
                    key={c} 
                    onClick={() => navigate(c === 'All' ? '/products' : `/category/${c.toLowerCase()}`)}
                    className="flex items-center justify-between group cursor-pointer"
                  >
                    <span className={`text-sm transition-colors ${isCatActive ? 'text-primary font-bold' : 'text-slate-400 group-hover:text-white'}`}>{c}</span>
                    <span className="text-[10px] bg-dark-card px-2 py-0.5 rounded-full text-slate-500">{getCategoryCount(c)}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-slate-500">Price Range</h3>
            <div className="space-y-4">
               <input type="range" className="w-full accent-primary" min="0" max="5000" />
               <div className="flex justify-between text-xs text-slate-500">
                 <span>$0</span>
                 <span>$5,000+</span>
               </div>
            </div>
          </div>

          <div>
             <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-slate-500">Brand</h3>
             <div className="space-y-2">
                {currentBrands.map(brand => (
                  <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-dark-border bg-dark-bg accent-primary" />
                    <span className="text-sm text-slate-400 group-hover:text-white">{brand}</span>
                  </label>
                ))}
             </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="relative">
            <Input 
              placeholder="Search in this category..." 
              className="pl-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-2.5 w-5 h-5 text-slate-500" />
          </div>

          <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                showCartAction={true}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-dark-card border border-dark-border rounded-xl text-slate-500">
              No approved products available in this section.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
