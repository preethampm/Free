export function StepIndicator({
  current,
  total,
}: {
  current: number
  total: number
}) {
  return (
    <div className="flex items-center justify-center gap-1 mb-6">
      {Array.from({ length: total }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center gap-1">
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
              ${step === current
                ? 'bg-black text-white'
                : step < current
                  ? 'bg-gray-800 text-white'
                  : 'border border-gray-300 text-gray-400'
              }
            `}
          >
            {step}
          </div>
          {step < total && (
            <div className={`w-6 h-px ${step < current ? 'bg-gray-800' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
