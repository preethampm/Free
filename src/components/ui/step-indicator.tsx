export function StepIndicator({
  current,
  total,
}: {
  current: number
  total: number
}) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-6">
      {Array.from({ length: total }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center gap-1 sm:gap-1.5">
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
              ${step === current
                ? 'bg-[#1D9E75] text-[#E1F5EE]'
                : step < current
                  ? 'bg-[#0F6E56] text-[#E1F5EE]'
                  : 'border border-gray-300 text-gray-400'
              }
            `}
          >
            {step}
          </div>
          {step < total && (
            <div className={`w-4 sm:w-6 h-px ${step < current ? 'bg-[#0F6E56]' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
