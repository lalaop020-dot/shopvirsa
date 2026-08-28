import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Play, Download, Search, AlertTriangle, FileJson, CheckCircle } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Pagination } from '../../components/common/Pagination'
import { useProductStore } from '../../store/useProductStore'
import { formatCurrency } from '../../utils/formatters'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function AdminStoreroom() {
  const storeroomProducts = useProductStore((state) => state.storeroomProducts) || []
  const fetchStoreroomProducts = useProductStore((state) => state.fetchStoreroomProducts)
  const addStoreroomProduct = useProductStore((state) => state.addStoreroomProduct)
  const editStoreroomProduct = useProductStore((state) => state.editStoreroomProduct)
  const removeStoreroomProduct = useProductStore((state) => state.removeStoreroomProduct)
  const bulkUploadProducts = useProductStore((state) => state.bulkUploadProducts)
  
  useEffect(() => {
    fetchStoreroomProducts()
  }, [fetchStoreroomProducts])

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])
  
  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  // Manual Form State
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [stock, setStock] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')

  // Bulk input state
  const [bulkJson, setBulkJson] = useState('')

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setName('')
    setPrice('')
    setCategory('')
    setStock('')
    setImageUrl('')
    setDescription('')
    setProductModalOpen(true)
  }

  const handleOpenEdit = (p) => {
    setEditingProduct(p)
    setName(p.name)
    setPrice(p.price)
    setCategory(p.category)
    setStock(p.stock)
    setImageUrl(p.image || '')
    setDescription(p.description || '')
    setProductModalOpen(true)
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    if (!name || !price || !category || !stock) {
      toast.error('Please fill in required fields')
      return
    }

    const payload = {
      name,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      image: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      description
    }

    let success = false
    if (editingProduct) {
      success = await editStoreroomProduct(editingProduct.id, payload)
      if (success) toast.success('Product updated in global storeroom!')
    } else {
      success = await addStoreroomProduct(payload)
      if (success) toast.success('New product registered in global storeroom!')
    }

    if (success) {
      setProductModalOpen(false)
    } else {
      toast.error('Operation failed')
    }
  }

  const handleDelete = async (id, prodName) => {
    if (window.confirm(`WARNING: Deleting "${prodName}" will delete it from all active seller storefronts. Continue?`)) {
      const success = await removeStoreroomProduct(id)
      if (success) {
        toast.success(`Removed "${prodName}" and cleared from seller inventories.`)
      } else {
        toast.error('Failed to delete product')
      }
    }
  }

  const handleCrawlerClick = () => {
    toast.error('Crawler feature is currently disabled')
  }

  const handleBulkSubmit = async (e) => {
    e.preventDefault()
    const success = await bulkUploadProducts(bulkJson)
    if (success) {
      toast.success('Bulk products uploaded successfully!')
      setBulkJson('')
      setBulkModalOpen(false)
    } else {
      toast.error('Invalid JSON structure or upload failed. Please check and retry.')
    }
  }

  const filtered = storeroomProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const ITEMS_PER_PAGE = 200
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1
  const paginatedProducts = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const sampleJson = JSON.stringify([
    {
      "name": "Bose QuietComfort Ultra",
      "price": 429,
      "category": "Audio",
      "stock": 60,
      "image": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500",
      "description": "Noise cancelling wireless earbuds."
    }
  ], null, 2)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Storeroom Inventory Control</h1>
          <p className="text-slate-400">Add, edit, remove, bulk upload, or crawl products available for sellers to import.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="flex items-center gap-2 border-primary/20 text-primary hover:bg-primary/5" onClick={handleCrawlerClick}>
            <Play className="w-4 h-4" /> Crawl Products
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setBulkModalOpen(true)}>
            <Download className="w-4 h-4" /> Bulk JSON Upload
          </Button>
          <Button className="flex items-center gap-2" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4" /> Add Product Manually
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-grow">
          <Input 
            placeholder="Search global storeroom..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-dark-bg text-slate-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Product ID</th>
                <th className="px-6 py-4 font-medium">Product Details</th>
                <th className="px-6 py-4 font-medium">Base Price</th>
                <th className="px-6 py-4 font-medium">Initial Stock</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-dark-bg/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm">{product.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'} 
                        alt={product.name} 
                        className="w-10 h-10 bg-slate-850 rounded-lg object-cover shrink-0" 
                      />
                      <div>
                        <div className="font-bold text-sm text-white">{product.name}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest">{product.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-200">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4 text-slate-400">{product.stock} units</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => handleOpenEdit(product)}
                      className="p-2 hover:bg-dark-bg rounded-lg text-slate-400 hover:text-white transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id, product.name)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-500">
                    No products currently available in the storeroom.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={(page) => {
              setCurrentPage(page)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        )}
      </Card>

      {/* Manual Product Add/Edit Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setProductModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-lg p-8 rounded-2xl relative z-10 overflow-y-auto max-h-[90vh]"
          >
            <h2 className="text-2xl font-bold mb-6">{editingProduct ? 'Edit Storeroom Product' : 'Add Storeroom Product'}</h2>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <Input 
                label="Product Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Category" 
                  placeholder="e.g. Electronics, Audio" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  required 
                />
                <Input 
                  label="Base Price ($)" 
                  type="number"
                  step="0.01" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)} 
                  required 
                />
              </div>
              <Input 
                label="Initial Stock Quantity" 
                type="number" 
                value={stock} 
                onChange={(e) => setStock(e.target.value)} 
                required 
              />
              <Input 
                label="Image URL" 
                placeholder="https://..." 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Product Description</label>
                <textarea 
                  className="input-field min-h-[100px] py-3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-dark-border">
                <Button variant="outline" className="flex-grow" type="button" onClick={() => setProductModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-grow">Save Product</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Bulk JSON Upload Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setBulkModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-lg p-8 rounded-2xl relative z-10"
          >
            <h2 className="text-2xl font-bold mb-2">Bulk JSON Import</h2>
            <p className="text-xs text-slate-400 mb-4">Upload an array of products in standard JSON formatting to populate the storeroom instantly.</p>
            
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FileJson className="w-4 h-4 text-primary" /> Target JSON Payload
                </label>
                <textarea 
                  className="input-field min-h-[180px] py-3 font-mono text-xs leading-relaxed"
                  placeholder={sampleJson}
                  value={bulkJson}
                  onChange={(e) => setBulkJson(e.target.value)}
                  required
                />
              </div>

              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] text-slate-400 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>Ensure properties like "name", "price", "stock", and "category" exist. Missing fields will use default fallbacks.</span>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-grow" type="button" onClick={() => setBulkModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-grow">Import Payload</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
