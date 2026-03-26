'use client'

import { useState } from 'react'

export function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(
      `${window.location.origin}/e/${slug}`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className={`text-xs font-medium rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5 ${
        copied
          ? 'bg-[#E1F5EE] text-[#0F6E56] border border-[#1D9E75]/30'
          : 'border border-[#1D9E75]/20 text-gray-600 hover:border-[#1D9E75] hover:text-[#1D9E75] hover:bg-[#E1F5EE]/50'
      }`}
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Copy link
        </>
      )}
    </button>
  )
}
