'use client'

import { useRef, useCallback, useEffect } from 'react'
import QRCode from 'qrcode'

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

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 0,
        color: { dark: '#000000', light: '#ffffff' },
      })
    }
  }, [url])

  const downloadPng = useCallback(async () => {
    const html2canvas = (await import('html2canvas')).default
    const card = document.getElementById(`qr-card-${itemName}`)
    if (!card) return

    const canvas = await html2canvas(card, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    })

    const link = document.createElement('a')
    link.download = `${itemName.replace(/\s+/g, '-').toLowerCase()}-qr.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [itemName])

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div
        id={`qr-card-${itemName}`}
        className="bg-white p-8 flex flex-col items-center gap-4"
        style={{ width: 300, margin: '0 auto' }}
      >
        <p className="text-xs font-medium tracking-widest uppercase text-gray-400">
          {eventName}
        </p>
        <div className="w-px h-3 bg-gray-200" />
        <canvas ref={canvasRef} />
        <div className="text-center">
          <p className="font-medium text-sm">{itemName}</p>
          <p className="text-xs text-gray-400 mt-1">Scan to rate</p>
        </div>
      </div>
      <button
        onClick={downloadPng}
        className="mt-3 w-full py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
      >
        Download PNG
      </button>
    </div>
  )
}
