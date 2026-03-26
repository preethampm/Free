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
    <div className="border border-gray-200 rounded-lg p-4">
      <p className="text-sm font-medium mb-3">{label}</p>
      <div className="flex gap-2 justify-between">
        {scores.map((score) => (
          <button
            key={score}
            onClick={() => onChange(score)}
            className={`
              w-11 h-11 rounded-lg text-base font-medium transition-all
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
      <div className="flex justify-between text-xs text-gray-400 mt-1.5 px-0.5">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  )
}
