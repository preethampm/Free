'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'

export function AuthNavbar() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header className="border-b border-[#1D9E75]/15 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/votu_logo.svg"
            alt="votu"
            width={110}
            height={35}
            priority
            style={{ height: 'auto' }}
          />
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-[#1D9E75] px-3 py-1.5 rounded-lg hover:bg-[#E1F5EE]/50 transition-all"
          >
            Dashboard
          </Link>
          <Link
            href="/create"
            className="text-sm font-medium text-gray-600 hover:text-[#1D9E75] px-3 py-1.5 rounded-lg hover:bg-[#E1F5EE]/50 transition-all"
          >
            Create
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm font-medium text-gray-400 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all ml-1"
          >
            Sign out
          </button>
        </nav>
      </div>
    </header>
  )
}
