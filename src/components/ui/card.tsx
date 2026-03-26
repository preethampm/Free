export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`border border-[#1D9E75]/15 rounded-2xl p-5 bg-white ${className}`}>
      {children}
    </div>
  )
}
