'use client'

import { useState } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { Logo } from '@/src/components/logo'

type SignupMethod = 'google' | 'email' | 'otp'

function SignupContent() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'
  const [method, setMethod] = useState<SignupMethod>('google')

  async function signUpWithGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
      },
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="lg" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold tracking-tight">
            Create account
          </h1>
          <p className="text-gray-400 mt-2 leading-relaxed">
            Sign up to create and manage your votu events.
          </p>

          {/* Method tabs */}
          <div className="mt-6 flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setMethod('google')}
              className={`flex-1 text-xs font-medium py-2.5 transition-colors ${
                method === 'google'
                  ? 'bg-[#1D9E75] text-white'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Google
            </button>
            <button
              onClick={() => setMethod('email')}
              className={`flex-1 text-xs font-medium py-2.5 transition-colors border-x border-gray-200 ${
                method === 'email'
                  ? 'bg-[#1D9E75] text-white'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setMethod('otp')}
              className={`flex-1 text-xs font-medium py-2.5 transition-colors ${
                method === 'otp'
                  ? 'bg-[#1D9E75] text-white'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Phone
            </button>
          </div>

          {/* Google */}
          {method === 'google' && (
            <button
              onClick={signUpWithGoogle}
              className="mt-6 w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg px-4 py-3.5 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>
          )}

          {/* Email - Coming soon */}
          {method === 'email' && (
            <div className="mt-6 text-center">
              <div className="border border-gray-200 rounded-lg px-4 py-6">
                <p className="text-sm text-gray-400 font-medium">Coming soon</p>
                <p className="text-xs text-gray-300 mt-1">Email sign up will be available soon.</p>
              </div>
            </div>
          )}

          {/* Phone OTP - Coming soon */}
          {method === 'otp' && (
            <div className="mt-6 text-center">
              <div className="border border-gray-200 rounded-lg px-4 py-6">
                <p className="text-sm text-gray-400 font-medium">Coming soon</p>
                <p className="text-xs text-gray-300 mt-1">Phone sign up will be available soon.</p>
              </div>
            </div>
          )}

          <p className="mt-6 text-xs text-gray-400 text-center">
            Free forever. No credit card required.
          </p>

          <p className="mt-4 text-sm text-gray-500 text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-[#1D9E75] font-medium hover:underline">
              Log in
            </Link>
          </p>

          <div className="mt-10 border-t border-gray-100 pt-6 text-center">
            <p className="text-xs text-gray-400">
              No account needed for attendees.<br />
              Just scan a QR code and rate.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  )
}
