import { ShoppingCart, Plus, Eye, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from './common/Button'
import useCartStore from '../store/useCartStore'
import toast from 'react-hot-toast'

export function ProductCard({ product, onImport, isImported, showCartAction = false }) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product, 1)
    toast.success(`${product.name} added to cart!`)
  }

  const isOutOfStock = product.stock === 0

  // Deterministic pseudo-rating from product id for visual purposes
  const ratingValue = product.id
    ? ((parseInt(String(product.id).replace(/\D/g, '').slice(-2) || '42', 10) % 15) / 10 + 3.5).toFixed(1)
    : '4.5'
  const ratingNum = parseFloat(ratingValue)

  return (
    <div className="product-card-lift group bg-dark-card border border-dark-border rounded-xl overflow-hidden flex flex-col h-full">
      <Link to={`/product/${product.globalId || product.id}`} className="block relative">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-slate-800/80">
          <img
            src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Overlay with quick-view on hover (desktop) */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-end justify-center pb-3 gap-2">
            <span className="text-white text-xs font-semibold bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Quick View
            </span>
          </div>

          {/* Out of stock badge */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-xs font-bold bg-slate-800/80 px-3 py-1.5 rounded-full">Out of Stock</span>
            </div>
          )}

          {/* Hot badge for high-stock items */}
          {!isOutOfStock && product.stock > 50 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              HOT
            </div>
          )}

          {/* Import badge */}
          {isImported && (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              In Shop
            </div>
          )}
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-2.5 sm:p-3 flex flex-col flex-1 gap-1.5">
        {/* Category */}
        <div className="text-[10px] text-primary font-bold uppercase tracking-widest truncate">
          {product.category}
        </div>

        {/* Product name */}
        <Link to={`/product/${product.globalId || product.id}`}>
          <h3 className="text-sm font-semibold text-dark-text leading-snug line-clamp-2 hover:text-primary transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating row */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3 h-3 ${star <= Math.round(ratingNum) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-500">({ratingValue})</span>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div>
            <span className="text-base sm:text-lg font-bold text-white">
              ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
            </span>
            {product.stock > 0 && product.stock <= 10 && (
              <div className="text-[10px] text-orange-400 font-medium">Only {product.stock} left!</div>
            )}
            {product.stock > 10 && (
              <div className="text-[10px] text-slate-500">{product.stock} in stock</div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-1.5 mt-1">
          {showCartAction && !isOutOfStock && (
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-semibold py-2 rounded-lg transition-all duration-200 active:scale-95 shadow-sm shadow-primary/20"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Add to Cart</span>
              <span className="xs:hidden">Cart</span>
            </button>
          )}

          {onImport && !isImported && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onImport(product) }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-secondary hover:bg-secondary-dark text-white text-xs font-semibold py-2 rounded-lg transition-all duration-200 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Import
            </button>
          )}

          {isOutOfStock && showCartAction && (
            <button
              disabled
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-700 text-slate-500 text-xs font-semibold py-2 rounded-lg cursor-not-allowed"
            >
              Out of Stock
            </button>
          )}

          <Link
            to={`/product/${product.globalId || product.id}`}
            className="p-2 border border-dark-border hover:border-primary/50 hover:bg-primary/10 rounded-lg transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-primary" />
          </Link>
        </div>
      </div>
    </div>
  )
}
