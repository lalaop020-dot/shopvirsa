import { Check, X, ShieldAlert, CheckCircle2, History } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import usePlatformStore from '../../store/usePlatformStore'
import toast from 'react-hot-toast'

export default function AdminTransactions() {
  const transactions = usePlatformStore((state) => state.transactions)
  const approveDeposit = usePlatformStore((state) => state.approveDeposit)
  const rejectDeposit = usePlatformStore((state) => state.rejectDeposit)
  const approveWithdrawal = usePlatformStore((state) => state.approveWithdrawal)
  const rejectWithdrawal = usePlatformStore((state) => state.rejectWithdrawal)

  const handleApprove = (tx) => {
    if (tx.type === 'Deposit') {
      approveDeposit(tx.id)
      toast.success(`Deposit request ${tx.id} approved! Seller balance updated.`)
    } else {
      approveWithdrawal(tx.id)
      toast.success(`Withdrawal request ${tx.id} approved! Sent successfully.`)
    }
  }

  const handleReject = (tx) => {
    if (tx.type === 'Deposit') {
      rejectDeposit(tx.id)
      toast.success(`Deposit request ${tx.id} rejected.`)
    } else {
      rejectWithdrawal(tx.id)
      toast.success(`Withdrawal request ${tx.id} rejected. Funds returned.`)
    }
  }

  const pending = transactions.filter(t => t.status === 'Pending')
  const completed = transactions.filter(t => t.status !== 'Pending')

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Transactions Management</h1>
        <p className="text-slate-400">Review and approve manual cryptocurrency deposits and withdrawals.</p>
      </div>

      {/* Pending Requests */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-dark-border flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2 text-accent-gold">
            <ShieldAlert className="w-5 h-5" /> Pending Actions ({pending.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-dark-bg text-slate-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Tx ID</th>
                <th className="px-6 py-4 font-medium">Seller</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Hash / Address</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {pending.map((tx) => (
                <tr key={tx.id} className="hover:bg-dark-bg/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm">{tx.id}</td>
                  <td className="px-6 py-4 text-sm font-semibold">{tx.sellerEmail}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      tx.type === 'Deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold">${tx.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 font-mono text-xs max-w-[200px] truncate" title={tx.txHash || tx.walletAddress}>
                    {tx.type === 'Deposit' ? `TXID: ${tx.txHash}` : `To: ${tx.walletAddress}`}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{tx.date}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleReject(tx)}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4" /> Reject
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(tx)}
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
                    No pending transactions awaiting approval.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* History */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-dark-border flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-primary" /> Processed Transactions History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-dark-bg text-slate-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Tx ID</th>
                <th className="px-6 py-4 font-medium">Seller</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Proof / Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {completed.map((tx) => (
                <tr key={tx.id} className="hover:bg-dark-bg/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm">{tx.id}</td>
                  <td className="px-6 py-4 text-sm">{tx.sellerEmail}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      tx.type === 'Deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold">${tx.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 ${
                      tx.status === 'Approved' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        tx.status === 'Approved' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{tx.date}</td>
                  <td className="px-6 py-4 font-mono text-xs max-w-[200px] truncate" title={tx.txHash || tx.walletAddress}>
                    {tx.type === 'Deposit' ? `TXID: ${tx.txHash}` : `To: ${tx.walletAddress}`}
                  </td>
                </tr>
              ))}
              {completed.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-500">
                    No transaction history found.
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
