'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Leaf, Mail, Lock, User, Github, Chrome, Eye, EyeOff, Briefcase, Building } from 'lucide-react'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountType, setAccountType] = useState('INDIVIDUAL')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          accountType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      setSuccess('Account created successfully! Signing you in...')
      
      // Auto sign in after successful signup
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Account created but sign in failed. Please try signing in manually.')
      } else {
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      }

    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: '/dashboard' })
    } catch (error) {
      setError('OAuth sign up failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-carbon-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center gap-3 text-white hover:text-primary-green transition-colors">
            <Leaf size={32} className="text-primary-green" />
            <h1 className="text-2xl font-bold tracking-tight">CarbonWise</h1>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-carbon-muted">
            Start tracking your carbon footprint today
          </p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-carbon-card border border-carbon-border rounded-xl p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-primary-green/10 border border-primary-green/20 text-primary-green px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Account Type Selector */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                This account is for...
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAccountType('INDIVIDUAL')}
                  className={`flex items-center justify-center gap-3 p-4 border rounded-lg transition-all duration-200 ${
                    accountType === 'INDIVIDUAL'
                      ? 'border-primary-green bg-primary-green/10 text-primary-green'
                      : 'border-carbon-border text-carbon-muted hover:border-carbon-light hover:text-white'
                  }`}
                >
                  <User size={20} />
                  <span className="font-semibold">An Individual</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('BUSINESS')}
                  className={`flex items-center justify-center gap-3 p-4 border rounded-lg transition-all duration-200 ${
                    accountType === 'BUSINESS'
                      ? 'border-primary-green bg-primary-green/10 text-primary-green'
                      : 'border-carbon-border text-carbon-muted hover:border-carbon-light hover:text-white'
                  }`}
                >
                  <Building size={20} />
                  <span className="font-semibold">A Business</span>
                </button>
              </div>
            </div>

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                Full name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={20} className="text-carbon-muted" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-carbon-border rounded-lg bg-carbon-dark text-white placeholder-carbon-muted focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-carbon-muted" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-carbon-border rounded-lg bg-carbon-dark text-white placeholder-carbon-muted focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-carbon-muted" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-carbon-border rounded-lg bg-carbon-dark text-white placeholder-carbon-muted focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-carbon-muted hover:text-white" />
                  ) : (
                    <Eye size={20} className="text-carbon-muted hover:text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-carbon-muted" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-carbon-border rounded-lg bg-carbon-dark text-white placeholder-carbon-muted focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-primary-green"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-carbon-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-carbon-card text-carbon-muted">Or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className="w-full inline-flex justify-center py-3 px-4 border border-carbon-border rounded-lg bg-carbon-dark text-white hover:bg-carbon-border transition-colors disabled:opacity-50"
            >
              <Chrome size={20} />
              <span className="ml-2">Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
              className="w-full inline-flex justify-center py-3 px-4 border border-carbon-border rounded-lg bg-carbon-dark text-white hover:bg-carbon-border transition-colors disabled:opacity-50"
            >
              <Github size={20} />
              <span className="ml-2">GitHub</span>
            </button>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-carbon-muted">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-primary-green hover:text-primary-green/80 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-carbon-muted">
            By creating an account, you agree to our{' '}
            <Link href="/privacy" className="text-primary-green hover:text-primary-green/80">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link href="/terms" className="text-primary-green hover:text-primary-green/80">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 