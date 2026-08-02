import { useEffect } from 'react'
import { Check, X, ShieldAlert, Award, Power, PowerOff } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import usePlatformStore from '../../store/usePlatformStore'
import toast from 'react-hot-toast'

export default function AdminPackages() {
  const packageRequests = usePlatformStore((state) => state.packageRequests) || []
  const fetchAllPackageRequests = usePlatformStore((state) => state.fetchAllPackageRequests)
  const approvePackage = usePlatformStore((state) => state.approvePackage)
  const rejectPackage = usePlatformStore((state) => state.rejectPackage)
  const allSellers = usePlatformStore((state) => state.allSellers) || []
  const fetchAllSellers = usePlatformStore((state) => state.fetchAllSellers)

  useEffect(() => {
    fetchAllPackageRequests()
    fetchAllSellers()
  }, [fetchAllPackageRequests, fetchAllSellers])

  const handleApprove = async (reqId) => {
    const success = await approvePackage(reqId)
    if (success) {
      toast.success('Package upgrade request approved successfully!')
    } else {
      toast.error('Failed to approve package request')
    }
  }

  const handleReject = async (reqId) => {
    const success = await rejectPackage(reqId)
    if (success) {
      toast.success('Package upgrade request rejected.')
    } else {
      toast.error('Failed to reject package request')
    }
  }

  const pending = packageRequests.filter(r => r.status === 'Pending' || r.status === 'pending')
  const completed = packageRequests.filter(r => r.status !== 'Pending' && r.status !== 'pending')

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Packages & Subscriptions</h1>
        <p className="text-slate-400">Review pending package upgrades, transaction proof hashes, and manage seller subscriptions.</p>
      </div>

      {/* Pending Upgrades */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-dark-border flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2 text-accent-gold">
            <ShieldAlert className="w-5 h-5 animate-pulse" /> Pending Upgrades ({pending.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-dark-bg text-slate-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Req ID</th>
                <th className="px-6 py-4 font-medium">Seller Email</th>
                <th className="px-6 py-4 font-medium">Plan Requested</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Wallet Address</th>
                <th className="px-6 py-4 font-medium">Tx Hash</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {pending.map((req) => (
                <tr key={req.id} className="hover:bg-dark-bg/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm">{req.id}</td>
                  <td className="px-6 py-4 font-semibold text-sm">{req.sellerEmail || req.seller_email || '—'}</td>
                  <td className="px-6 py-4 font-bold text-primary">{req.packageName || req.package_name}</td>
                  <td className="px-6 py-4 font-bold">${req.price || '—'}</td>
                  <td className="px-6 py-4 font-mono text-xs max-w-[150px] truncate" title={req.walletAddress || req.wallet_address}>{req.walletAddress || req.wallet_address || '—'}</td>
                  <td className="px-6 py-4 font-mono text-xs max-w-[150px] truncate text-slate-400" title={req.txHash || req.tx_hash}>{req.txHash || req.tx_hash || '—'}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleReject(req.id)}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4" /> Deny
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(req.id)}
                      className="bg-green-600 hover:bg-green-500"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </Button>
                  </td>
                </tr>
              ))}
              {pending.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-500">
                    No pending upgrades.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* All Sellers Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-dark-border">
          <h3 className="font-bold flex items-center gap-2"><Award className="w-5 h-5 text-primary" /> Active Sellers & Packages</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-dark-bg text-slate-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Seller Email</th>
                <th className="px-6 py-4 font-medium">Shop Name</th>
                <th className="px-6 py-4 font-medium">Current Package</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {allSellers.map((seller) => (
                <tr key={seller.id} className="hover:bg-dark-bg/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-sm">{seller.email}</td>
                  <td className="px-6 py-4 text-slate-300">{seller.shop_name || seller.shopName || '—'}</td>
                  <td className="px-6 py-4 font-bold text-primary">{seller.package_name || seller.packageName || 'Silver'}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 ${
                      seller.status === 'active' || seller.status === 'Active' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        seller.status === 'active' || seller.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      {seller.status}
                    </span>
                  </td>
                </tr>
              ))}
              {allSellers.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-slate-500">
                    No sellers found.
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
