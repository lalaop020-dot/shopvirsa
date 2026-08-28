import { useState, useEffect } from 'react'
import { Search, Filter, Warehouse, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { ProductCard } from '../../components/ProductCard'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Pagination } from '../../components/common/Pagination'
import { useProductStore } from '../../store/useProductStore'
import toast from 'react-hot-toast'

export default function ProductStorehouse() {
  const storeroomProducts = useProductStore((state) => state.storeroomProducts) || []
  const sellerProductsList = useProductStore((state) => state.sellerProducts) || []
  const importProduct = useProductStore((state) => state.importProductToSellerStore)
  const fetchStoreroomProducts = useProductStore((state) => state.fetchStoreroomProducts)
  const fetchSellerProducts = useProductStore((state) => state.fetchSellerProducts)
  const isLoading = useProductStore((state) => state.storeroomLoading)
  const fetchError = useProductStore((state) => state.storeroomError)

  const backendTotalProducts = useProductStore((state) => state.totalProducts) || 0

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isImporting, setIsImporting] = useState(null)
  const ITEMS_PER_PAGE = 24

  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 500)
    return () => clearTimeout(handler)
  }, [searchTerm])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    fetchStoreroomProducts({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: debouncedSearch || undefined
    })
    fetchSellerProducts()
  }, [fetchStoreroomProducts, fetchSellerProducts, currentPage, debouncedSearch])

  const importedIds = sellerProductsList.map(p => p.globalId || p.product_id || p.id)

  const handleImport = async (product) => {
    setIsImporting(product.id)
    try {
      const success = await importProduct(null, product.id)
      if (success) {
        toast.success(`${product.name} imported to your store!`)
      } else {
        toast.error('Failed to import product')
      }
    } catch (error) {
      toast.error('Failed to import product')
    } finally {
      setIsImporting(null)
    }
  }

  const filteredProducts = storeroomProducts
  const totalPages = Math.ceil(backendTotalProducts / ITEMS_PER_PAGE) || 1
  const paginatedProducts = filteredProducts

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Warehouse className="w-8 h-8 text-primary" /> Admin Storeroom
          </h1>
          <p className="text-slate-400">Choose from products pre-approved and imported by default by the system administrators.</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-grow">
          <Input 
            placeholder="Search approved products by name or category..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-dark-card border border-dark-border rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-dark-bg" />
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
        <div className="py-20 text-center bg-dark-card border border-red-500/20 rounded-2xl px-6 space-y-5">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Failed to Load Storeroom</h3>
            <p className="text-slate-400 max-w-md mx-auto text-sm">{fetchError}</p>
          </div>
          <button
            onClick={() => { fetchStoreroomProducts(); fetchSellerProducts() }}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {/* Product Grid */}
      {!isLoading && !fetchError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedProducts.map((product) => {
            const isAlreadyImported = importedIds.includes(product.id)
            return (
              <div key={product.id} className="relative group">
                <ProductCard 
                  product={product} 
                  onImport={() => handleImport(product)}
                  isImported={isAlreadyImported}
                  isLoading={isImporting === product.id}
                />
                {isAlreadyImported && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1.5 shadow-md flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!isLoading && !fetchError && backendTotalProducts > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={backendTotalProducts}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={(page) => {
            setCurrentPage(page)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
      )}

      {!isLoading && !fetchError && backendTotalProducts === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-dark-border rounded-xl">
          <div className="text-slate-500">No products found matching your search.</div>
        </div>
      )}
    </div>
  )
}
