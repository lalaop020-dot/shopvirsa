import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import useAuthStore from '../store/useAuthStore'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const setAuth = useAuthStore((state) => state.setAuth)
  const adminEmail = useAuthStore((state) => state.adminEmail)
  const adminPassword = useAuthStore((state) => state.adminPassword)
  const registeredUsers = useAuthStore((state) => state.registeredUsers) || []
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      let role = 'customer'
      let name = 'Demo User'
      
      if (data.email === adminEmail) {
        if (data.password !== adminPassword) {
          throw new Error('Invalid admin password')
        }
        role = 'admin'
        name = 'Admin User'
      } else {
        const user = registeredUsers.find(u => u.email === data.email)
        if (!user) {
          throw new Error('User not found. Please register.')
        }
        if (user.password !== data.password) {
          throw new Error('Incorrect password')
        }
        role = user.role
        name = user.name
      }

      setAuth({ email: data.email, name }, role, 'mock-token')
      toast.success(`Welcome back, ${role}!`)
      
      if (role === 'customer') navigate('/')
      else navigate(`/${role}/dashboard`)
    } catch (error) {
      toast.error(error.message || 'Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Welcome Back</h2>
        <p className="text-slate-400 text-sm">Login to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="relative">
          <Input
            id="email"
            label="Email Address"
            placeholder="name@example.com"
            className="pl-10"
            error={errors.email?.message}
            {...register('email')}
          />
          <Mail className="absolute left-3 top-[38px] w-5 h-5 text-slate-500" />
        </div>

        <div className="relative">
          <Input
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="pl-10"
            error={errors.password?.message}
            {...register('password')}
          />
          <Lock className="absolute left-3 top-[38px] w-5 h-5 text-slate-500" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-slate-500 hover:text-slate-300"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-dark-border bg-dark-bg accent-primary" />
            <span className="text-slate-400">Remember me</span>
          </label>
          <Link to="/forgot-password" title="Forgot Password?" className="text-primary hover:underline">Forgot password?</Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dark-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-dark-card px-2 text-slate-500">Or continue with</span>
        </div>
      </div>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dark-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-dark-card px-2 text-slate-500">Quick Demo Login</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-[10px] px-0 h-10 border-primary/30 hover:border-primary"
          onClick={() => {
            setAuth({ email: 'customer@demo.com', name: 'Demo Customer' }, 'customer', 'mock-token')
            toast.success('Logged in as Customer')
            navigate('/')
          }}
        >
          Customer
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-[10px] px-0 h-10 border-green-500/30 hover:border-green-500"
          onClick={() => {
            setAuth({ email: 'seller@demo.com', name: 'Demo Seller' }, 'seller', 'mock-token')
            toast.success('Logged in as Seller')
            navigate('/seller/dashboard')
          }}
        >
          Seller
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-[10px] px-0 h-10 border-red-500/30 hover:border-red-500"
          onClick={() => {
            setAuth({ email: adminEmail, name: 'Admin User' }, 'admin', 'mock-token')
            toast.success('Logged in as Admin')
            navigate('/admin/dashboard')
          }}
        >
          Admin
        </Button>
      </div>

      <p className="text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary font-bold hover:underline">Sign Up</Link>
      </p>
    </div>
  )
}
