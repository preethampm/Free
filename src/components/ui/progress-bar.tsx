export function ProgressBar({
  current,
  total,
  label,
}: {
  current: number
  total: number
  label?: string
}) {
  const pct = total > 0 ? (current / total) * 100 : 0

  return (
    <div>
      {label && (
        <div className="flex justify-between text-sm text-gray-500 mb-1.5">
          <span>{label}</span>
          <span className="font-medium">{current}/{total}</span>
        </div>
      )}
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="bg-black h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
