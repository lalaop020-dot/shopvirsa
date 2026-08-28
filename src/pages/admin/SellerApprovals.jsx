import { useState, useEffect } from 'react'
import { Check, X, ShieldAlert, Eye, Search } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import usePlatformStore from '../../store/usePlatformStore'
import toast from 'react-hot-toast'


export default function SellerApprovals() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('pending')

  const pendingSellers = usePlatformStore((state) => state.pendingSellers) || []
  const allSellers = usePlatformStore((state) => state.allSellers) || []
  const fetchPendingSellers = usePlatformStore((state) => state.fetchPendingSellers)
  const fetchAllSellers = usePlatformStore((state) => state.fetchAllSellers)
  const approveSeller = usePlatformStore((state) => state.approveSeller)
  const rejectSeller = usePlatformStore((state) => state.rejectSeller)

  useEffect(() => {
    fetchPendingSellers()
    fetchAllSellers()
  }, [fetchPendingSellers, fetchAllSellers])

  const handleAction = async (id, action) => {
    let success = false
    if (action === 'Approved') {
      success = await approveSeller(id)
    } else {
      success = await rejectSeller(id)
    }
    if (success) {
      toast.success(`Seller ${action} successfully!`)
    } else {
      toast.error(`Failed to ${action.toLowerCase()} seller`)
    }
  }

  // Show pending first, then all approved sellers
  const filteredPending = pendingSellers.filter(s =>
    (s.shop_name || s.shopName || s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAll = allSellers.filter(s =>
    (s.shop_name || s.shopName || s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Seller Approvals</h1>
        <p className="text-slate-400">Review and approve new seller registration requests.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'pending' ? 'primary' : 'outline'} 
            onClick={() => setActiveTab('pending')}
          >
            Pending Approvals ({pendingSellers.length})
          </Button>
          <Button 
            variant={activeTab === 'all' ? 'primary' : 'outline'} 
            onClick={() => setActiveTab('all')}
          >
            All Sellers ({allSellers.length})
          </Button>
        </div>
        <div className="relative w-full md:w-64">
          <Input 
            placeholder={activeTab === 'pending' ? "Search pending..." : "Search all sellers..."}
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-dark-border flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2 text-white">
            {activeTab === 'pending' ? (
              <><ShieldAlert className="w-5 h-5 text-accent-gold" /> Pending Approvals</>
            ) : (
              <><Check className="w-5 h-5 text-green-500" /> All Registered Sellers</>
            )}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-dark-bg text-slate-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Shop Name</th>
                <th className="px-6 py-4 font-medium">Owner</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Date Applied</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {(activeTab === 'pending' ? filteredPending : filteredAll).map((seller) => (
                <tr key={seller.id} className="hover:bg-dark-bg/50 transition-colors">
                  <td className="px-6 py-4 font-bold">{seller.shop_name || seller.shopName || '—'}</td>
                  <td className="px-6 py-4 text-slate-300">{seller.name}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{seller.email}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {seller.created_at ? new Date(seller.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {seller.status === 'Approved' || seller.status === 'approved' ? (
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-green-500/10 text-green-500">Approved</span>
                    ) : seller.status === 'Rejected' || seller.status === 'rejected' ? (
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-red-500/10 text-red-500">Rejected</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-accent-gold/10 text-accent-gold">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {activeTab === 'pending' || seller.status === 'Pending' || seller.status === 'pending' ? (
                      <>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleAction(seller.id, 'Approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleAction(seller.id, 'Rejected')}
                        >
                          <X className="w-4 h-4" /> Reject
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => {
                        // Quick toggle status for testing/admin purposes
                        const newStatus = seller.status === 'Approved' || seller.status === 'approved' ? 'Rejected' : 'Approved'
                        handleAction(seller.id, newStatus)
                      }}>
                        {seller.status === 'Approved' || seller.status === 'approved' ? 'Revoke Approval' : 'Approve'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(activeTab === 'pending' ? filteredPending : filteredAll).length === 0 && (
            <div className="text-center py-20 text-slate-500">
              No {activeTab === 'pending' ? 'pending' : ''} sellers found.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
