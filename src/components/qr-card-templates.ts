export interface QRTemplate {
  id: string
  name: string
  description: string
  cardClass: string
  qrContainerClass: string
  textPrimaryClass: string
  textSecondaryClass: string
  borderClass: string
  dividerClass?: string
  thumbnailBg: string
}

export const qrTemplates: QRTemplate[] = [
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple',
    cardClass: 'bg-white',
    qrContainerClass: 'bg-white',
    textPrimaryClass: 'text-gray-900',
    textSecondaryClass: 'text-gray-400',
    borderClass: 'border border-gray-200',
    dividerClass: 'bg-gray-200',
    thumbnailBg: 'bg-white border border-gray-200',
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Sleek dark mode',
    cardClass: 'bg-gray-900',
    qrContainerClass: 'bg-white',
    textPrimaryClass: 'text-white',
    textSecondaryClass: 'text-gray-400',
    borderClass: 'border border-gray-700',
    dividerClass: 'bg-gray-700',
    thumbnailBg: 'bg-gray-900 border border-gray-700',
  },
  {
    id: 'gradient',
    name: 'Gradient',
    description: 'Vibrant teal gradient',
    cardClass: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    qrContainerClass: 'bg-white',
    textPrimaryClass: 'text-white',
    textSecondaryClass: 'text-emerald-100',
    borderClass: '',
    dividerClass: 'bg-white/30',
    thumbnailBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  },
  {
    id: 'retro',
    name: 'Retro',
    description: 'Warm vintage vibes',
    cardClass: 'bg-amber-50',
    qrContainerClass: 'bg-white border-2 border-amber-300',
    textPrimaryClass: 'text-amber-900',
    textSecondaryClass: 'text-amber-500',
    borderClass: 'border-2 border-amber-300',
    dividerClass: 'bg-amber-300',
    thumbnailBg: 'bg-amber-50 border-2 border-amber-300',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professional & polished',
    cardClass: 'bg-white',
    qrContainerClass: 'bg-gray-50 border border-gray-200',
    textPrimaryClass: 'text-slate-800',
    textSecondaryClass: 'text-slate-400',
    borderClass: 'border border-gray-200',
    dividerClass: 'bg-gray-200',
    thumbnailBg: 'bg-white border border-gray-300 border-t-4 border-t-blue-600',
  },
]
