'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { qrTemplates, QRTemplate } from './qr-card-templates'

export function QRCard({
  eventName,
  itemName,
  url,
}: {
  eventName: string
  itemName: string
  url: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTemplate, setActiveTemplate] = useState<QRTemplate>(qrTemplates[0])
  const [customBackground, setCustomBackground] = useState<string | null>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 0,
        color: { dark: '#000000', light: '#ffffff' },
      })
    }
  }, [url])

  const handleTemplateSelect = useCallback((template: QRTemplate) => {
    setActiveTemplate(template)
    setCustomBackground(null)
  }, [])

  const handleCustomUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setCustomBackground(url)
    e.target.value = ''
  }, [])

  const downloadCard = useCallback(async () => {
    const html2canvas = (await import('html2canvas')).default
    const card = document.getElementById(`qr-card-${itemName}`)
    if (!card) return

    const canvas = await html2canvas(card, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
    })

    const link = document.createElement('a')
    link.download = `qr-card-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [itemName])

  const cardId = `qr-card-${itemName}`

  return (
    <div className="border border-[#1D9E75]/15 rounded-2xl bg-white p-4">
      {/* Card Preview - Fixed 2:3 aspect ratio */}
      <div
        id={cardId}
        className={`w-full max-w-[280px] mx-auto aspect-[2/3] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 overflow-hidden ${activeTemplate.cardClass} ${activeTemplate.borderClass}`}
        style={
          customBackground
            ? {
                backgroundImage: `url(${customBackground})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {/* Event name label */}
        <p
          className={`text-xs font-semibold tracking-widest uppercase ${activeTemplate.textSecondaryClass}`}
        >
          {eventName}
        </p>

        {/* Divider */}
        <div
          className={`w-8 h-px ${activeTemplate.dividerClass ?? 'bg-gray-200'}`}
        />

        {/* QR Code on white background for scannability */}
        <div
          className={`${activeTemplate.qrContainerClass} rounded-xl p-3 shadow-sm`}
        >
          <canvas ref={canvasRef} />
        </div>

        {/* Item info */}
        <div className="text-center">
          <p className={`font-semibold text-sm ${activeTemplate.textPrimaryClass}`}>
            {itemName}
          </p>
          <p className={`text-xs mt-1 ${activeTemplate.textSecondaryClass}`}>
            Scan to rate
          </p>
        </div>

        {/* Branding */}
        <p className={`text-[10px] font-medium ${activeTemplate.textSecondaryClass} opacity-60`}>
          votu
        </p>
      </div>

      {/* Download button */}
      <button
        onClick={downloadCard}
        className="mt-3 w-full py-2.5 text-sm font-medium bg-[#1D9E75] text-white rounded-xl hover:bg-[#0F6E56] transition-all active:scale-[0.98]"
      >
        Download Card
      </button>

      {/* Template Gallery */}
      <div className="mt-3">
        <p className="text-xs text-gray-400 font-medium mb-2">Choose a template</p>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {qrTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className={`flex-shrink-0 w-10 h-[60px] rounded-lg transition-all cursor-pointer ${template.thumbnailBg} ${
                activeTemplate.id === template.id
                  ? 'ring-2 ring-[#1D9E75] ring-offset-2 ring-offset-white'
                  : 'hover:ring-1 hover:ring-gray-300'
              }`}
              title={template.name}
            >
              <span className="sr-only">{template.name}</span>
            </button>
          ))}

          {/* Custom upload option */}
          <button
            onClick={handleCustomUpload}
            className={`flex-shrink-0 w-10 h-[60px] rounded-lg border-2 border-dashed transition-all cursor-pointer flex items-center justify-center ${
              customBackground
                ? 'border-[#1D9E75] ring-2 ring-[#1D9E75] ring-offset-2 ring-offset-white'
                : 'border-gray-300 hover:border-[#1D9E75]'
            }`}
            title="Upload your own design"
          >
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            <span className="sr-only">Upload your own design</span>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}
