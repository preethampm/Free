'use client'

export function CopyLinkButton({ slug }: { slug: string }) {
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(
          `${window.location.origin}/e/${slug}`
        )
      }}
      className="text-xs font-medium border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-all"
    >
      Copy link
    </button>
  )
}
