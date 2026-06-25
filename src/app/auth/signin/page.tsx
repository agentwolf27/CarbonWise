'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Leaf, Chrome, Github } from 'lucide-react'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Check for callback errors
  const callbackError = searchParams.get('error')

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true)
    setError('')
    try {
      const result = await signIn(provider, { 
        callbackUrl: '/dashboard',
        redirect: true 
      })
      
      if (result?.error) {
        setError(`Failed to sign in with ${provider}`)
      }
    } catch (error) {
      console.error('OAuth sign in error:', error)
      setError(`Failed to sign in with ${provider}`)
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
            Welcome back
          </h2>
          <p className="mt-2 text-carbon-muted">
            Sign in to track your carbon footprint
          </p>
        </div>

        {/* Sign In Form */}
        <div className="bg-carbon-card border border-carbon-border rounded-xl p-8 space-y-6">
          {(error || callbackError) && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error || `Authentication error: ${callbackError}`}
            </div>
          )}

          <div className="space-y-4">
            <p className="text-white text-center mb-6">
              Choose your preferred sign-in method:
            </p>
            
            {/* OAuth Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                className="w-full inline-flex justify-center items-center py-4 px-6 border border-carbon-border rounded-lg bg-carbon-dark text-white hover:bg-carbon-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Chrome size={20} />
                <span className="ml-3 text-lg">Continue with Google</span>
              </button>
              
              {process.env.NEXT_PUBLIC_GITHUB_ENABLED && (
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('github')}
                  disabled={isLoading}
                  className="w-full inline-flex justify-center items-center py-4 px-6 border border-carbon-border rounded-lg bg-carbon-dark text-white hover:bg-carbon-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Github size={20} />
                  <span className="ml-3 text-lg">Continue with GitHub</span>
                </button>
              )}
            </div>
          </div>

          {/* Info Notice */}
          <div className="text-center">
            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-3 rounded-lg text-sm">
              <p className="font-medium">Quick Setup Mode</p>
              <p className="text-xs mt-1">
                Email/password login temporarily disabled while setting up database
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-carbon-muted">
            By signing in, you agree to our{' '}
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