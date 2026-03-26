'use client'

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  type = 'button',
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  className?: string
  type?: 'button' | 'submit'
}) {
  const base = 'w-full py-3 rounded-lg text-base font-medium transition-all active:scale-[0.98]'
  const variants = {
    primary: disabled
      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
      : 'bg-[#1D9E75] text-[#E1F5EE] hover:bg-[#0F6E56]',
    secondary: disabled
      ? 'border border-gray-200 text-gray-300 cursor-not-allowed'
      : 'border border-[#1D9E75] text-[#1D9E75] hover:bg-[#E1F5EE]',
    danger: disabled
      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
      : 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
