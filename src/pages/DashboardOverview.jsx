import { useState, useEffect, useMemo } from 'react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Package, AlertCircle, BarChart3, Clock, CheckCircle2 } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import usePlatformStore, { DEFAULT_BALANCE } from '../store/usePlatformStore'
import { useProductStore } from '../store/useProductStore'

export default function DashboardOverview({ role }) {
  const { user } = useAuthStore()
  
  // Stores
  const balanceData = usePlatformStore((state) => state.balance) || DEFAULT_BALANCE
  const transactions = usePlatformStore((state) => state.transactions) || []
  const dashboardStats = usePlatformStore((state) => state.dashboardStats) || {}
  const packageRequests = usePlatformStore((state) => state.packageRequests) || []
  const fetchBalance = usePlatformStore((state) => state.fetchBalance)
  const fetchDashboardStats = usePlatformStore((state) => state.fetchDashboardStats)
  const fetchMyTransactions = usePlatformStore((state) => state.fetchMyTransactions)
  const fetchAllTransactions = usePlatformStore((state) => state.fetchAllTransactions)

  const myProducts = useProductStore((state) => state.sellerProducts) || []
  const storeroomProducts = useProductStore((state) => state.storeroomProducts) || []
  const fetchSellerProducts = useProductStore((state) => state.fetchSellerProducts)
  const fetchStoreroomProducts = useProductStore((state) => state.fetchStoreroomProducts)
  
  useEffect(() => {
    if (role === 'admin') {
      fetchDashboardStats()
      fetchAllTransactions()
      fetchStoreroomProducts()
    } else {
      fetchBalance()
      fetchMyTransactions()
      fetchSellerProducts()
    }
  }, [role, fetchDashboardStats, fetchAllTransactions, fetchStoreroomProducts, fetchBalance, fetchMyTransactions, fetchSellerProducts])

  // Extract Admin Stats from API response (using fallbacks for safety)
  const totalPlatformRevenue = dashboardStats.totalPlatformRevenue || 0
  const totalActiveSellers = dashboardStats.totalActiveSellers || 0
  const totalPlatformOrders = dashboardStats.totalPlatformOrders || 0
  const totalPendingApprovals = dashboardStats.totalPendingApprovals || 0
  const storeTotalProducts = useProductStore((state) => state.totalProducts) || 0
  const totalProducts = dashboardStats.totalProducts || storeTotalProducts || storeroomProducts.length
  
  // Extract Seller Stats
  const myTotalSales = myProducts.reduce((sum, p) => sum + (p.sales || 0), 0)
  const myStockAlerts = myProducts.filter(p => p.stock <= 5).length
  const myActiveProducts = myProducts.filter(p => p.status === 'Active').length

  // Build chart data
  const chartData = useMemo(() => {
    const months = Array(12).fill(0)
    const now = new Date()

    transactions.forEach(tx => {
      if (tx.status === 'Approved' || tx.status === 'approved') {
        const txDate = new Date(tx.date || tx.created_at)
        const monthDiff = (now.getFullYear() - txDate.getFullYear()) * 12 + (now.getMonth() - txDate.getMonth())
        if (monthDiff >= 0 && monthDiff < 12) {
          months[11 - monthDiff] += parseFloat(tx.amount || 0)
        }
      }
    })

    const maxVal = Math.max(...months, 1)
    return months.map(v => v === 0 ? 0 : Math.max(5, Math.round((v / maxVal) * 100)))
  }, [transactions])

  const chartRawValues = useMemo(() => {
    const months = Array(12).fill(0)
    const now = new Date()

    transactions.forEach(tx => {
      if (tx.status === 'Approved' || tx.status === 'approved') {
        const txDate = new Date(tx.date || tx.created_at)
        const monthDiff = (now.getFullYear() - txDate.getFullYear()) * 12 + (now.getMonth() - txDate.getMonth())
        if (monthDiff >= 0 && monthDiff < 12) {
          months[11 - monthDiff] += parseFloat(tx.amount || 0)
        }
      }
    })
    return months
  }, [transactions])

  const monthLabels = useMemo(() => {
    const now = new Date()
    const labels = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      labels.push(d.toLocaleString('default', { month: 'short' }))
    }
    return labels
  }, [])

  const activities = useMemo(() => {
    const list = []
    
    transactions.slice(0, 3).forEach(tx => {
      list.push({
        text: `${tx.type || 'Transaction'} of $${parseFloat(tx.amount || 0).toFixed(2)} — ${String(tx.status).toLowerCase()} ${tx.sellerEmail ? `(${tx.sellerEmail})` : ''}`,
        time: tx.date || tx.created_at,
        type: String(tx.type).toLowerCase(),
        statusColor: (tx.status === 'Approved' || tx.status === 'approved') ? 'bg-green-500' : (tx.status === 'Pending' || tx.status === 'pending') ? 'bg-yellow-500' : 'bg-red-500'
      })
    })

    if (role === 'admin') {
      const lowStockProducts = storeroomProducts.filter(p => p.stock <= 5)
      lowStockProducts.slice(0, 2).forEach(p => {
        list.push({
          text: `⚠️ "${p.name}" has only ${p.stock} units left`,
          time: 'Stock Alert',
          type: 'alert',
          statusColor: 'bg-orange-500'
        })
      })
    } else {
      myProducts.filter(p => p.stock <= 5).slice(0, 2).forEach(p => {
        list.push({
          text: `⚠️ "${p.name}" has only ${p.stock} units left`,
          time: 'Stock Alert',
          type: 'alert',
          statusColor: 'bg-orange-500'
        })
      })
    }

    if (list.length === 0) {
      list.push({
        text: 'No recent activity.',
        time: 'Now',
        type: 'info',
        statusColor: 'bg-slate-500'
      })
    }

    return list.slice(0, 6)
  }, [transactions, storeroomProducts, myProducts, role])

  const adminStats = [
    {
      label: 'Total Revenue',
      value: `$${totalPlatformRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: totalPlatformRevenue > 0 ? 'Growing' : '$0',
      trend: totalPlatformRevenue > 0 ? 'up' : 'neutral',
      icon: DollarSign,
      color: 'text-green-500',
      subtitle: 'From approved deposits'
    },
    {
      label: 'Total Products',
      value: totalProducts.toString(),
      change: 'Active in storeroom',
      trend: totalProducts > 0 ? 'up' : 'neutral',
      icon: Package,
      color: 'text-primary',
      subtitle: 'Global inventory'
    },
    {
      label: 'Total Orders',
      value: totalPlatformOrders.toString(),
      change: `${totalActiveSellers} active sellers`,
      trend: totalPlatformOrders > 0 ? 'up' : 'neutral',
      icon: ShoppingCart,
      color: 'text-accent-gold',
      subtitle: 'Combined seller sales'
    },
    {
      label: 'Pending Approvals',
      value: totalPendingApprovals.toString(),
      change: totalPendingApprovals > 0 ? 'Action Required' : 'All Clear',
      trend: totalPendingApprovals > 0 ? 'alert' : 'neutral',
      icon: AlertCircle,
      color: totalPendingApprovals > 0 ? 'text-red-500' : 'text-green-500',
      subtitle: 'Transactions and packages'
    },
  ]

  const sellerStats = [
    {
      label: 'My Balance',
      value: `$${parseFloat(balanceData.balance || 0).toFixed(2)}`,
      change: `$${parseFloat(balanceData.withdrawable || 0).toFixed(2)} available`,
      trend: (balanceData.balance || 0) > 0 ? 'up' : 'neutral',
      icon: DollarSign,
      color: 'text-green-500',
      subtitle: `$${parseFloat(balanceData.totalWithdrawn || 0).toFixed(2)} withdrawn`
    },
    {
      label: 'My Products',
      value: myProducts.length.toString(),
      change: `${myActiveProducts} active`,
      trend: myProducts.length > 0 ? 'up' : 'neutral',
      icon: Package,
      color: 'text-primary',
      subtitle: `${myTotalSales} total sales`
    },
    {
      label: 'Total Sales',
      value: myTotalSales.toString(),
      change: myTotalSales > 0 ? 'Generating revenue' : 'No sales yet',
      trend: myTotalSales > 0 ? 'up' : 'neutral',
      icon: ShoppingCart,
      color: 'text-accent-gold',
      subtitle: `Across ${myProducts.length} products`
    },
    {
      label: 'Stock Alerts',
      value: myStockAlerts.toString(),
      change: myStockAlerts > 0 ? 'Low stock!' : 'All stocked',
      trend: myStockAlerts > 0 ? 'alert' : 'neutral',
      icon: AlertCircle,
      color: myStockAlerts > 0 ? 'text-red-500' : 'text-green-500',
      subtitle: myStockAlerts > 0 ? 'Products need restocking' : 'Inventory healthy'
    },
  ]

  const stats = role === 'admin' ? adminStats : sellerStats

  return (
    <div className="space-y-8 animate-fade-in">
      {role === 'seller' && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          (user?.status === 'Approved' || user?.status === 'approved')
            ? 'bg-green-500/10 border-green-500/20 text-green-500'
            : (user?.status === 'Rejected' || user?.status === 'rejected')
            ? 'bg-red-500/10 border-red-500/20 text-red-500'
            : 'bg-accent-gold/10 border-accent-gold/20 text-accent-gold'
        }`}>
          {user?.status === 'Approved' || user?.status === 'approved' ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : user?.status === 'Rejected' || user?.status === 'rejected' ? (
            <AlertCircle className="w-6 h-6" />
          ) : (
            <Clock className="w-6 h-6" />
          )}
          <div>
            <h3 className="font-bold text-sm">
              Account Status: {user?.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Pending'}
            </h3>
            <p className="text-xs opacity-80 mt-0.5">
              {user?.status === 'Approved' || user?.status === 'approved'
                ? 'Your seller account is approved and active.'
                : user?.status === 'Rejected' || user?.status === 'rejected'
                ? 'Your seller application was rejected. Please contact support.'
                : 'Your seller application is under review by our team.'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl bg-dark-bg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-full ${
                stat.trend === 'up' ? 'text-green-500 bg-green-500/10' :
                stat.trend === 'alert' ? 'text-red-500 bg-red-500/10' :
                'text-slate-400 bg-slate-500/10'
              }`}>
                {stat.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                {stat.trend === 'alert' && <AlertCircle className="w-3 h-3" />}
                {stat.trend === 'neutral' && <BarChart3 className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-[10px] text-slate-500 mt-1">{stat.subtitle}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 min-h-[400px] flex flex-col justify-between">
           <div className="flex items-center justify-between mb-8">
             <div>
               <h3 className="font-bold text-lg">{role === 'admin' ? 'Platform Revenue' : 'My Revenue'}</h3>
               <p className="text-xs text-slate-500 mt-1">Monthly breakdown from {role === 'admin' ? 'all approved deposits' : 'your transactions'}</p>
             </div>
             <div className="flex gap-2 items-center">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="w-3 h-3 bg-primary rounded-full" /> Revenue
                </div>
                <span className="text-[10px] text-slate-400 bg-dark-bg px-2 py-0.5 rounded ml-2 font-medium">
                  12 MONTHS
                </span>
             </div>
           </div>
           {/* Chart Area */}
           <div className="flex-grow flex items-end gap-2 px-4 pb-4 h-48">
              {chartData.map((h, i) => (
                <div 
                  key={i} 
                  style={{ height: `${Math.max(h, 2)}%` }} 
                  className={`flex-grow rounded-t-sm transition-all duration-500 group relative cursor-pointer ${
                    h > 0 ? 'bg-primary/30 hover:bg-primary' : 'bg-dark-border/30'
                  }`}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-dark-card border border-dark-border px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap shadow-lg">
                    <div className="font-bold">${chartRawValues[i].toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div className="text-slate-500">{monthLabels[i]}</div>
                  </div>
                </div>
              ))}
           </div>
           <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-widest pt-4 border-t border-dark-border">
              {monthLabels.filter((_, i) => i % 3 === 0 || i === 11).map((label, i) => (
                <span key={i}>{label}</span>
              ))}
           </div>
        </Card>

        <Card className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Recent Activity</h3>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <div className="space-y-4">
            {activities.map((activity, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 shadow-lg ${activity.statusColor}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-slate-300 leading-snug">{activity.text}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{new Date(activity.time).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
