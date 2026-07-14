import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Store, Mail, Lock, User, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import useAuthStore from '../store/useAuthStore'
import toast from 'react-hot-toast'

const sellerSchema = z.object({
  shopName: z.string().min(3, 'Shop name must be at least 3 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function SellerRegister() {
  const [isLoading, setIsLoading] = useState(false)
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(sellerSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setAuth({ email: data.email, name: data.name }, 'seller', 'mock-token')
      toast.success('Shop application submitted!')
      navigate('/setup-password')
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Sell on Shopiversa</h2>
        <p className="text-slate-400 text-sm">Start your business in minutes</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {[
          '300-2000 Product Limits',
          'Fast Crypto Payouts',
          'Global Storefront Access',
        ].map(benefit => (
          <div key={benefit} className="flex items-center gap-2 text-xs text-green-500 font-medium">
            <CheckCircle2 className="w-4 h-4" /> {benefit}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <div className="relative">
          <Input label="Shop Name" placeholder="My Awesome Store" className="pl-10" error={errors.shopName?.message} {...register('shopName')} />
          <Store className="absolute left-3 top-[38px] w-5 h-5 text-slate-500" />
        </div>
        <div className="relative">
          <Input label="Owner Name" placeholder="John Doe" className="pl-10" error={errors.name?.message} {...register('name')} />
          <User className="absolute left-3 top-[38px] w-5 h-5 text-slate-500" />
        </div>
        <div className="relative">
          <Input label="Business Email" placeholder="business@example.com" className="pl-10" error={errors.email?.message} {...register('email')} />
          <Mail className="absolute left-3 top-[38px] w-5 h-5 text-slate-500" />
        </div>
        <div className="relative">
          <Input label="Password" type="password" placeholder="••••••••" className="pl-10" error={errors.password?.message} {...register('password')} />
          <Lock className="absolute left-3 top-[38px] w-5 h-5 text-slate-500" />
        </div>

        <Button type="submit" className="w-full h-12" isLoading={isLoading}>
          Launch My Shop
        </Button>
      </form>

      <p className="text-center text-sm text-slate-400">
        Already have a shop?{' '}
        <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
      </p>
    </div>
  )
}
