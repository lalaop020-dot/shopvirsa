import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [],

      createOrder: (cartItems, shippingInfo, paymentMethod) => {
        const orderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000)
        const date = new Date().toISOString()

        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const tax = subtotal * 0.08
        const shipping = 0
        const total = subtotal + tax + shipping

        const order = {
          id: orderId,
          items: cartItems.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            category: item.category,
            sellerEmail: item.sellerEmail
          })),
          subtotal,
          tax,
          shipping,
          total,
          status: 'Processing',
          shippingAddress: { ...shippingInfo },
          paymentMethod,
          createdAt: date
        }

        set((state) => ({
          orders: [order, ...state.orders]
        }))

        return order
      },

      getOrdersByCustomer: (email) => {
        return get().orders.filter(o => o.shippingAddress?.email === email)
      },

      getOrdersForSeller: (email) => {
        return get().orders
          .filter(o => o.items.some(item => item.sellerEmail === email))
          .map(o => {
            const sellerItems = o.items.filter(item => item.sellerEmail === email)
            const sellerSubtotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            const sellerTax = sellerSubtotal * 0.08
            const sellerTotal = sellerSubtotal + sellerTax
            return {
              ...o,
              items: sellerItems,
              subtotal: sellerSubtotal,
              tax: sellerTax,
              total: sellerTotal
            }
          })
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map(o =>
            o.id === orderId ? { ...o, status } : o
          )
        }))
      },

      getAllOrders: () => get().orders
    }),
    {
      name: 'shopiversa-orders-v1'
    }
  )
)

export default useOrderStore
