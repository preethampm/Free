export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`border border-gray-200 rounded-lg p-5 ${className}`}>
      {children}
    </div>
  )
}
