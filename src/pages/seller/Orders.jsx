import { useState, useEffect } from 'react'
import { Filter, Search, Eye, Truck, CheckCircle2, Clock, XCircle, ShoppingBag } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import useOrderStore from '../../store/useOrderStore'

export default function SellerOrders() {
  const [searchTerm, setSearchTerm] = useState('')
  const orders = useOrderStore(state => state.orders) || []
  const fetchSellerOrders = useOrderStore(state => state.fetchSellerOrders)
  const updateOrderStatus = useOrderStore(state => state.updateOrderStatus)
  const isLoading = useOrderStore(state => state.isLoading)

  useEffect(() => {
    fetchSellerOrders()
  }, [fetchSellerOrders])

  const mappedOrders = orders.map(o => ({
    id: o.id,
    customer: o.shippingAddress?.name || o.shipping_address?.name || o.customer_name || 'Unknown',
    items: (o.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0),
    total: parseFloat(o.total || 0),
    date: o.createdAt || o.created_at ? new Date(o.createdAt || o.created_at).toLocaleDateString() : '—',
    status: o.status || 'Processing',
    rawOrder: o
  }))

  const filteredOrders = mappedOrders.filter(order =>
    String(order.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing': return 'bg-blue-500/10 text-blue-500'
      case 'shipped': return 'bg-accent-gold/10 text-accent-gold'
      case 'delivered': return 'bg-green-500/10 text-green-500'
      case 'cancelled': return 'bg-red-500/10 text-red-500'
      default: return 'bg-slate-500/10 text-slate-500'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing': return <Clock className="w-4 h-4" />
      case 'shipped': return <Truck className="w-4 h-4" />
      case 'delivered': return <CheckCircle2 className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Orders Management</h1>
        <p className="text-slate-400">Track and fulfill customer orders.</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-grow">
          <Input 
            placeholder="Search by Order ID or Customer..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
        </div>
        <Button variant="outline"><Filter className="w-4 h-4" /> Filter</Button>
      </div>

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
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-dark-bg/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-bold">{order.id}</td>
                  <td className="px-6 py-4 text-slate-300">{order.customer}</td>
                  <td className="px-6 py-4 text-slate-400">{order.items}</td>
                  <td className="px-6 py-4 font-bold">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{order.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 w-fit ${getStatusStyle(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" /> Details
                    </Button>
                  </td>
                </tr>
              ))}
              {isLoading && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-500">
                    Loading orders...
                  </td>
                </tr>
              )}
              {!isLoading && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-16">
                    <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <div className="text-slate-400 font-medium">No orders yet</div>
                    <div className="text-xs text-slate-500 mt-1">Orders will appear here when customers make purchases.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
