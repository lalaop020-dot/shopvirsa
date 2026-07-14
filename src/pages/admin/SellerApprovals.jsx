import { useState } from 'react'
import { Check, X, ShieldAlert, Eye, Search } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import toast from 'react-hot-toast'


export default function SellerApprovals() {
  const [shops, setShops] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const handleAction = (id, action) => {
    setShops(shops.filter(shop => shop.id !== id))
    toast.success(`Shop ${action} successfully!`)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Seller Approvals</h1>
        <p className="text-slate-400">Review and approve new seller registration requests.</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-grow">
          <Input 
            placeholder="Search pending shops..." 
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
                <th className="px-6 py-4 font-medium">Shop Name</th>
                <th className="px-6 py-4 font-medium">Owner</th>
                <th className="px-6 py-4 font-medium">Date Applied</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {shops.map((shop) => (
                <tr key={shop.id} className="hover:bg-dark-bg/50 transition-colors">
                  <td className="px-6 py-4 font-bold">{shop.name}</td>
                  <td className="px-6 py-4 text-slate-300">{shop.owner}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{shop.date}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-accent-gold/10 text-accent-gold">
                      {shop.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <Button variant="ghost" size="sm" title="View Details">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleAction(shop.id, 'Approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleAction(shop.id, 'Rejected')}
                    >
                      <X className="w-4 h-4" /> Reject
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shops.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              No pending seller requests at the moment.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
