'use client'

export function ScoreGrid({
  label,
  value,
  onChange,
  min = 1,
  max = 5,
}: {
  label: string
  value: number
  onChange: (score: number) => void
  min?: number
  max?: number
}) {
  const scores = Array.from({ length: max - min + 1 }, (_, i) => i + min)

  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <p className="text-base sm:text-sm font-medium mb-4 sm:mb-3">{label}</p>
      <div className="flex gap-2 sm:gap-1.5 justify-between">
        {scores.map((score) => (
          <button
            key={score}
            onClick={() => onChange(score)}
            className={`
              flex-1 min-w-0 h-14 sm:h-11 rounded-lg text-lg sm:text-base font-medium transition-all active:scale-95
              ${value === score
                ? 'bg-[#1D9E75] text-[#E1F5EE]'
                : 'border border-gray-200 text-gray-600 hover:border-gray-400'
              }
            `}
          >
            {score}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-2 px-0.5">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  )
}
