'use client'

export function PreviewLinkButton({ slug }: { slug: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        window.open(`/e/${slug}`, '_blank', 'noopener,noreferrer')
      }}
      className="text-xs font-medium border border-gray-200 text-gray-500 rounded-lg px-3 py-2 sm:py-1.5 hover:border-gray-300 hover:text-gray-700 transition-all cursor-pointer bg-transparent min-h-[36px]"
    >
      Preview
    </button>
  )
}
