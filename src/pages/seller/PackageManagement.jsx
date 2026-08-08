import { useState, useEffect, useMemo } from 'react'
import { Check, ShieldCheck, CreditCard, Lock, Radio, AlertCircle } from 'lucide-react'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const PACKAGES = [
  {
    name: 'Silver',
    price: '$0',
    period: '/mo',
    priceVal: 0,
    features: [
      'Up to 50 active products',
      'Basic statistics & reports',
      'Standard customer support',
      '3% transaction fee'
    ]
  },
  {
    name: 'Gold',
    price: '$499',
    period: '/mo',
    priceVal: 499,
    popular: true,
    features: [
      'Up to 500 active products',
      'Advanced analytics & heatmaps',
      'Priority customer support (24/7)',
      '1.5% transaction fee',
      'Exclusive promotion tools'
    ]
  },
  {
    name: 'Platinum',
    price: '$999',
    period: '/mo',
    priceVal: 999,
    features: [
      'Unlimited active products',
      'Real-time deep analytics API',
      'Dedicated account manager',
      '0.5% transaction fee',
      'Custom storefront design themes',
      'Beta access to new features'
    ]
  }
]

export default function PackageManagement() {
  const [currentPackage, setCurrentPackage] = useState(null)
  const [myRequests, setMyRequests] = useState([])
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [walletAddress, setWalletAddress] = useState('')
  const [txHash, setTxHash] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchCurrentPackage = async () => {
    try {
      const res = await api.get('/packages/current')
      setCurrentPackage(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMyRequests = async () => {
    try {
      const res = await api.get('/packages/requests')
      let data = Array.isArray(res.data) ? res.data : (res.data?.requests || res.data?.items || res.data?.data || [])
      if (!Array.isArray(data)) data = []
      setMyRequests(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchCurrentPackage()
    fetchMyRequests()
  }, [])

  const hasPendingRequest = myRequests.some(r => r.status === 'Pending' || r.status === 'pending')
  const currentPlanName = currentPackage?.package_name || currentPackage?.packageName || 'Silver'
  const currentStatus = currentPackage?.status || 'Active'

  const packages = PACKAGES.map(pkg => ({
    ...pkg,
    current: pkg.name === currentPlanName
  }))

  const handleOpenCheckout = (pkg) => {
    if (pkg.name === 'Silver') {
      toast.success('Silver is our free tier.')
      return
    }
    if (pkg.current) {
      toast.success(`You are already subscribed to ${pkg.name}.`)
      return
    }
    if (hasPendingRequest) {
      toast.error('You already have a pending upgrade request. Please wait for admin approval.')
      return
    }
    setSelectedPlan(pkg)
    setWalletAddress('')
    setTxHash('')
    setCheckoutModalOpen(true)
  }

  const handleSubmitRequest = async (e) => {
    e.preventDefault()
    if (!walletAddress) {
      toast.error('Wallet address is required')
      return
    }
    setIsSubmitting(true)
    try {
      await api.post('/packages/request', {
        packageName: selectedPlan.name,
        price: selectedPlan.priceVal,
        walletAddress,
        txHash: txHash || null
      })
      toast.success('Package upgrade request submitted! Awaiting admin approval.')
      setCheckoutModalOpen(false)
      fetchMyRequests()
    } catch (err) {
      toast.error('Failed to submit request')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Package Subscriptions</h1>
        <p className="text-slate-400">Upgrade your membership plan to unlock premium capabilities.</p>
      </div>

      {currentStatus === 'Frozen' && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
          <div>
            <h4 className="font-bold text-red-400">Your Subscription is FROZEN</h4>
            <p className="text-xs text-slate-400 mt-1">Your access has been restricted by the Administrator. Please contact support to reactivate your store.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.name} className={`relative flex flex-col ${pkg.popular ? 'border-primary' : ''}`}>
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                Most Popular
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className={`w-5 h-5 ${pkg.current ? 'text-green-500' : 'text-primary'}`} />
                <h3 className="text-xl font-bold">{pkg.name}</h3>
                {pkg.current && (
                  <span className="text-[10px] bg-green-500/10 text-green-500 font-bold px-2 py-0.5 rounded-full ml-auto">Current</span>
                )}
              </div>
              <div className="text-3xl font-extrabold mb-6">
                {pkg.price} <span className="text-sm text-slate-500 font-normal">{pkg.period}</span>
              </div>
              <ul className="space-y-3">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <Button
                variant={pkg.current ? 'outline' : 'primary'}
                className="w-full"
                onClick={() => handleOpenCheckout(pkg)}
                disabled={pkg.current || pkg.name === 'Silver'}
              >
                {pkg.current ? 'Active Plan' : pkg.name === 'Silver' ? 'Free Tier' : 'Upgrade Now'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* My Requests History */}
      {myRequests.length > 0 && (
        <Card className="p-0 overflow-hidden">
          <div className="p-6 border-b border-dark-border">
            <h3 className="font-bold">My Upgrade Requests</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-dark-bg text-slate-400 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">Package</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {myRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-dark-bg/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary">{req.packageName || req.package_name}</td>
                    <td className="px-6 py-4">${req.price || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        req.status === 'Approved' || req.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                        req.status === 'Rejected' || req.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                        'bg-accent-gold/10 text-accent-gold'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {req.created_at ? new Date(req.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Checkout Modal */}
      {checkoutModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCheckoutModalOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-8 rounded-2xl relative z-10"
          >
            <h2 className="text-2xl font-bold mb-2">Upgrade to {selectedPlan.name}</h2>
            <p className="text-slate-400 text-sm mb-6">Send payment and submit transaction proof for admin approval.</p>

            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl mb-6">
              <div className="text-sm font-bold text-primary mb-1">Payment Amount</div>
              <div className="text-3xl font-bold">{selectedPlan.price}<span className="text-sm text-slate-400">{selectedPlan.period}</span></div>
              <div className="text-xs text-slate-400 mt-1">Send to admin USDT TRC20 wallet</div>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <Input
                label="Your Wallet Address (From)"
                placeholder="Enter your sending wallet address"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                required
              />
              <Input
                label="Transaction Hash (optional)"
                placeholder="Enter TXID after sending payment"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
              />
              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-grow" type="button" onClick={() => setCheckoutModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-grow" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
