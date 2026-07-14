import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_STOREROOM_PRODUCTS = []

export const EMPTY_SELLER_PRODUCTS = Object.freeze([])

const DEFAULT_SELLER_PRODUCTS = {}

export const useProductStore = create(
  persist(
    (set, get) => ({
      storeroomProducts: DEFAULT_STOREROOM_PRODUCTS,
      sellerProducts: DEFAULT_SELLER_PRODUCTS,
      categories: [],

      getAllActiveSellerProducts: () => {
        const state = get()
        return Object.entries(state.sellerProducts || {}).flatMap(([email, products]) => 
          products.map(p => ({ ...p, sellerEmail: email }))
        )
      },

      // Admin actions
      addStoreroomProduct: (product) => set((state) => {
        const newProduct = {
          ...product,
          id: Date.now(),
          price: parseFloat(product.price) || 0,
          stock: parseInt(product.stock) || 0
        }
        
        // Refresh categories if it's a new category
        const newCategories = [...state.categories]
        if (product.category && !newCategories.includes(product.category)) {
          newCategories.push(product.category)
        }

        return {
          storeroomProducts: [newProduct, ...state.storeroomProducts],
          categories: newCategories
        }
      }),

      editStoreroomProduct: (id, updated) => set((state) => ({
        storeroomProducts: state.storeroomProducts.map(p => 
          p.id === id ? { ...p, ...updated, price: parseFloat(updated.price), stock: parseInt(updated.stock) } : p
        )
      })),

      removeStoreroomProduct: (id) => set((state) => {
        // Remove from storeroom
        const newStoreroom = state.storeroomProducts.filter(p => p.id !== id)
        
        // Cascade delete from all sellers' stores!
        const updatedSellerProducts = {}
        Object.keys(state.sellerProducts).forEach(email => {
          updatedSellerProducts[email] = state.sellerProducts[email].filter(p => p.globalId !== id)
        })

        // Recompute active categories in storeroom
        const activeCategories = Array.from(new Set(newStoreroom.map(p => p.category)))

        return {
          storeroomProducts: newStoreroom,
          sellerProducts: updatedSellerProducts,
          categories: activeCategories
        }
      }),

      bulkUploadProducts: (productsJson) => {
        try {
          const list = JSON.parse(productsJson)
          if (!Array.isArray(list)) throw new Error('Data must be an array of products')
          
          set((state) => {
            const formatted = list.map((item, idx) => ({
              id: Date.now() + idx,
              name: item.name || 'Bulk Product',
              price: parseFloat(item.price) || 99,
              category: item.category || 'General',
              stock: parseInt(item.stock) || 50,
              image: item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
              description: item.description || ''
            }))

            const newCats = [...state.categories]
            formatted.forEach(p => {
              if (p.category && !newCats.includes(p.category)) {
                newCats.push(p.category)
              }
            })

            return {
              storeroomProducts: [...formatted, ...state.storeroomProducts],
              categories: newCats
            }
          })
          return true
        } catch (e) {
          console.error(e)
          return false
        }
      },

      crawlProductsSimulation: () => set((state) => {
        const crawlerList = [
          {
            id: Date.now(),
            name: 'Apple Watch Ultra 2',
            price: 799,
            category: 'Electronics',
            stock: 40,
            image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500',
            description: 'Rugged GPS smartwatch with multi-day battery life.'
          },
          {
            id: Date.now() + 1,
            name: 'Keychron Q1 Max Keyboard',
            price: 219,
            category: 'Computers',
            stock: 25,
            image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500',
            description: 'Custom mechanical keyboard with hot-swappable switches.'
          },
          {
            id: Date.now() + 2,
            name: 'AirPods Pro 2',
            price: 249,
            category: 'Audio',
            stock: 85,
            image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500',
            description: 'MagSafe USB-C case, active noise cancellation, adaptive audio.'
          }
        ]

        const newCats = [...state.categories]
        crawlerList.forEach(p => {
          if (p.category && !newCats.includes(p.category)) {
            newCats.push(p.category)
          }
        })

        return {
          storeroomProducts: [...crawlerList, ...state.storeroomProducts],
          categories: newCats
        }
      }),

      // Seller actions
      importProductToSellerStore: (sellerEmail, globalId) => set((state) => {
        const globalProd = state.storeroomProducts.find(p => p.id === globalId)
        if (!globalProd) return {}

        const list = state.sellerProducts[sellerEmail] || []
        
        // Prevent duplicate import
        if (list.some(p => p.globalId === globalId)) return {}

        const imported = {
          id: Date.now(),
          name: globalProd.name,
          price: globalProd.price,
          category: globalProd.category,
          stock: globalProd.stock,
          sales: 0,
          status: 'Active',
          globalId: globalId,
          image: globalProd.image,
          description: globalProd.description
        }

        return {
          sellerProducts: {
            ...state.sellerProducts,
            [sellerEmail]: [imported, ...list]
          }
        }
      }),

      removeSellerProduct: (sellerEmail, id) => set((state) => {
        const list = state.sellerProducts[sellerEmail] || []
        return {
          sellerProducts: {
            ...state.sellerProducts,
            [sellerEmail]: list.filter(p => p.id !== id)
          }
        }
      }),

      updateSellerProduct: (sellerEmail, id, updates) => set((state) => {
        const list = state.sellerProducts[sellerEmail] || []
        return {
          sellerProducts: {
            ...state.sellerProducts,
            [sellerEmail]: list.map(p => p.id === id ? { ...p, ...updates } : p)
          }
        }
      })
    }),
    {
      name: 'shopiversa-products-v2'
    }
  )
)
