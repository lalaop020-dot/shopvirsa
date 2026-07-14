import { Check, X, ShieldAlert, Award, Power, PowerOff, ListFilter } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import usePlatformStore from '../../store/usePlatformStore'
import toast from 'react-hot-toast'

export default function AdminPackages() {
  const packageRequests = usePlatformStore((state) => state.packageRequests)
  const approvePackageRequest = usePlatformStore((state) => state.approvePackageRequest)
  const rejectPackageRequest = usePlatformStore((state) => state.rejectPackageRequest)
  
  const sellerSubscriptions = usePlatformStore((state) => state.sellerSubscriptions)
  const freezePackage = usePlatformStore((state) => state.freezePackage)
  const unfreezePackage = usePlatformStore((state) => state.unfreezePackage)

  const handleApprove = (reqId) => {
    approvePackageRequest(reqId)
    toast.success('Package upgrade request approved successfully!')
  }

  const handleReject = (reqId) => {
    rejectPackageRequest(reqId)
    toast.success('Package upgrade request rejected.')
  }

  const handleToggleFreeze = (email, currentStatus) => {
    if (currentStatus === 'Frozen') {
      unfreezePackage(email)
      toast.success(`Account subscription reactivated for ${email}`)
    } else {
      freezePackage(email)
      toast.error(`Account subscription frozen for ${email}`)
    }
  }

  const pending = packageRequests.filter(r => r.status === 'Pending')
  const completed = packageRequests.filter(r => r.status !== 'Pending')

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Packages & Subscriptions</h1>
        <p className="text-slate-400">Review pending package upgrades, transaction proof hashes, and manage seller package freeze states.</p>
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
                  <td className="px-6 py-4 font-semibold text-sm">{req.sellerEmail}</td>
                  <td className="px-6 py-4 font-bold text-primary">{req.packageName}</td>
                  <td className="px-6 py-4 font-bold">${req.price}</td>
                  <td className="px-6 py-4 font-mono text-xs max-w-[150px] truncate" title={req.walletAddress}>{req.walletAddress}</td>
                  <td className="px-6 py-4 font-mono text-xs max-w-[150px] truncate text-slate-400" title={req.txHash}>{req.txHash}</td>
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

      {/* Active Subscriptions & Freeze Controls */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-dark-border">
          <h3 className="font-bold flex items-center gap-2"><Award className="w-5 h-5 text-primary" /> Active Subscriptions Management</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-dark-bg text-slate-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Seller Email</th>
                <th className="px-6 py-4 font-medium">Current Package</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Freeze Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {Object.keys(sellerSubscriptions).map((email) => {
                const sub = sellerSubscriptions[email]
                return (
                  <tr key={email} className="hover:bg-dark-bg/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-sm">{email}</td>
                    <td className="px-6 py-4 font-bold text-primary">{sub.name}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 ${
                        sub.status === 'Active' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          sub.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Button 
                        variant={sub.status === 'Frozen' ? 'primary' : 'danger'}
                        size="sm" 
                        onClick={() => handleToggleFreeze(email, sub.status)}
                        className="flex items-center gap-1.5"
                      >
                        {sub.status === 'Frozen' ? (
                          <>
                            <Power className="w-4 h-4" /> Unfreeze Plan
                          </>
                        ) : (
                          <>
                            <PowerOff className="w-4 h-4" /> Freeze Plan
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
