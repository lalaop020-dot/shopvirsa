import { useState, useEffect, useMemo, useRef } from 'react'
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, History, Plus, Image as ImageIcon, Copy, Check } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import usePlatformStore, { DEFAULT_BALANCE } from '../../store/usePlatformStore'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

// Admin USDT address - hardcoded since it comes from the backend profile/settings
const ADMIN_USDT_WALLET = 'TY6b8f9G2h7L1m5N3k8R0q4Wp1Xz9VcV7b'

export default function Wallet() {
  const balanceData = usePlatformStore((state) => state.balance) || DEFAULT_BALANCE
  const transactions = usePlatformStore((state) => state.transactions) || []
  const fetchBalance = usePlatformStore((state) => state.fetchBalance)
  const fetchMyTransactions = usePlatformStore((state) => state.fetchMyTransactions)
  const submitDeposit = usePlatformStore((state) => state.submitDeposit)
  const requestWithdrawal = usePlatformStore((state) => state.requestWithdrawal)

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Form states
  const [depositAmount, setDepositAmount] = useState('')
  const [depositTxid, setDepositTxid] = useState('')
  const [depositProof, setDepositProof] = useState(null)
  const fileInputRef = useRef(null)
  
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [withdrawPass, setWithdrawPass] = useState('')

  useEffect(() => {
    fetchBalance()
    fetchMyTransactions()
  }, [fetchBalance, fetchMyTransactions])

  const balance = parseFloat(balanceData.balance || 0)
  const withdrawable = parseFloat(balanceData.withdrawable || 0)
  const pendingDeposit = parseFloat(balanceData.pendingDeposit || balanceData.pending_deposit || 0)
  const totalWithdrawn = parseFloat(balanceData.totalWithdrawn || balanceData.total_withdrawn || 0)

  const stats = [
    { label: 'Total Balance', value: `$${balance.toFixed(2)}`, icon: WalletIcon, color: 'text-primary' },
    { label: 'Withdrawable', value: `$${withdrawable.toFixed(2)}`, icon: ArrowUpRight, color: 'text-green-500' },
    { label: 'Pending Deposit', value: `$${pendingDeposit.toFixed(2)}`, icon: History, color: 'text-accent-gold' },
    { label: 'Total Withdrawn', value: `$${totalWithdrawn.toFixed(2)}`, icon: ArrowDownLeft, color: 'text-red-500' },
  ]

  const handleCopy = () => {
    navigator.clipboard.writeText(ADMIN_USDT_WALLET)
    setCopied(true)
    toast.success('Wallet address copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDepositSubmit = async (e) => {
    e.preventDefault()
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Invalid deposit amount')
      return
    }

    const formData = new FormData()
    formData.append('amount', parseFloat(depositAmount))
    if (depositTxid) formData.append('txHash', depositTxid)
    formData.append('method', 'USDT (TRC20)')
    if (depositProof) formData.append('proof', depositProof)

    const success = await submitDeposit(formData)
    if (success) {
      toast.success('Deposit request submitted! Waiting for admin approval.')
      setDepositAmount('')
      setDepositTxid('')
      setDepositProof(null)
      setIsDepositModalOpen(false)
    } else {
      toast.error('Failed to submit deposit request')
    }
  }

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault()
    const amt = parseFloat(withdrawAmount)
    if (!withdrawAmount || amt <= 0) {
      toast.error('Invalid withdrawal amount')
      return
    }
    if (!withdrawAddress) {
      toast.error('Destination wallet address is required')
      return
    }
    if (amt > withdrawable) {
      toast.error('Insufficient withdrawable balance')
      return
    }

    const success = await requestWithdrawal({
      amount: amt,
      walletAddress: withdrawAddress,
      transactionPassword: withdrawPass || null,
      method: 'USDT TRC20 / BTC'
    })

    if (success) {
      toast.success('Withdrawal request submitted! Admin will process it shortly.')
      setWithdrawAmount('')
      setWithdrawAddress('')
      setWithdrawPass('')
      setIsWithdrawModalOpen(false)
    } else {
      toast.error('Withdrawal failed. Please check your balance or try again.')
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Wallet</h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setIsWithdrawModalOpen(true)}>Withdraw</Button>
          <Button onClick={() => setIsDepositModalOpen(true)}><Plus className="w-4 h-4" /> Deposit</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-dark-bg ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-slate-400">{stat.label}</div>
              <div className="text-xl font-bold">{stat.value}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-dark-border flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2"><History className="w-5 h-5 text-primary" /> Transaction History</h3>
          <Button variant="ghost" size="sm">Export CSV</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-dark-bg text-slate-400 text-sm">
              <tr>
                <th className="px-6 py-4 font-medium">Transaction ID</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {transactions.map((tx) => {
                const txType = tx.type || tx.tx_type || ''
                const txStatus = tx.status || ''
                const txAmount = parseFloat(tx.amount || 0)
                const txDate = tx.date || tx.created_at
                return (
                  <tr key={tx.id} className="hover:bg-dark-bg/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm">{tx.id}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        txType.toLowerCase() === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {txType}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {txType.toLowerCase() === 'deposit' ? '+' : '-'} ${txAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 ${
                        txStatus.toLowerCase() === 'pending' ? 'text-accent-gold' :
                        txStatus.toLowerCase() === 'approved' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          txStatus.toLowerCase() === 'pending' ? 'bg-accent-gold animate-pulse' :
                          txStatus.toLowerCase() === 'approved' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        {txStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {txDate ? new Date(txDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs max-w-[200px] truncate" title={tx.txHash || tx.tx_hash || tx.walletAddress || tx.wallet_address}>
                      {txType.toLowerCase() === 'deposit'
                        ? `TXID: ${tx.txHash || tx.tx_hash || '—'}`
                        : `To: ${tx.walletAddress || tx.wallet_address || '—'}`}
                    </td>
                  </tr>
                )
              })}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDepositModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-card w-full max-w-lg p-8 rounded-2xl relative z-10"
          >
            <h2 className="text-2xl font-bold mb-6">Manual Crypto Deposit</h2>
            <form onSubmit={handleDepositSubmit} className="space-y-6">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl mb-6">
                <div className="text-sm font-bold text-primary mb-1">USDT Wallet Address (TRC20)</div>
                <div className="font-mono text-sm break-all">{ADMIN_USDT_WALLET}</div>
                <button 
                  type="button" 
                  onClick={handleCopy}
                  className="mt-2 text-primary text-xs font-bold flex items-center gap-1.5 hover:underline"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Address'}
                </button>
              </div>

              <Input 
                label="Amount (USD)" 
                placeholder="0.00" 
                type="number" 
                step="0.01"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                required 
              />
              <Input 
                label="Transaction ID (TXID)" 
                placeholder="Enter the TX hash (optional)" 
                value={depositTxid}
                onChange={(e) => setDepositTxid(e.target.value)}
              />
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Upload Screenshot (Proof)</label>
                <div 
                  className="border border-dashed border-dark-border rounded-xl p-6 text-center hover:border-primary transition-all cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2 group-hover:text-primary transition-all" />
                  <div className="text-xs text-slate-400">
                    {depositProof ? depositProof.name : 'Click to upload or drag and drop'}
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5">PNG, JPG up to 5MB</div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => setDepositProof(e.target.files[0])}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-grow" type="button" onClick={() => setIsDepositModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-grow">Submit Request</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsWithdrawModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-card w-full max-w-lg p-8 rounded-2xl relative z-10"
          >
            <h2 className="text-2xl font-bold mb-6">Withdraw Funds</h2>
            <form onSubmit={handleWithdrawSubmit} className="space-y-6">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
                <div className="text-sm text-red-400 font-bold mb-1">Available to Withdraw</div>
                <div className="text-2xl font-bold">${withdrawable.toFixed(2)}</div>
              </div>

              <Input 
                label="Withdrawal Amount ($)" 
                placeholder="0.00" 
                type="number" 
                step="0.01"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                required 
              />
              <Input 
                label="Destination Wallet Address" 
                placeholder="Enter destination USDT TRC20 / BTC address" 
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                required 
              />
              
              <div className="space-y-2">
                <Input 
                  label="Transaction Password" 
                  placeholder="••••••" 
                  type="password" 
                  value={withdrawPass}
                  onChange={(e) => setWithdrawPass(e.target.value)}
                  className="tracking-widest"
                />
                <p className="text-[10px] text-slate-500">Required for security verification.</p>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-grow" type="button" onClick={() => setIsWithdrawModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-grow" variant="danger">Request Withdrawal</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
