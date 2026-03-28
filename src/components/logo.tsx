'use client'

import Link from 'next/link'
import Image from 'next/image'

const SIZES = {
  sm: { width: 120, height: 38 },
  md: { width: 180, height: 57 },
  lg: { width: 240, height: 76 },
} as const

type LogoSize = keyof typeof SIZES

export function Logo({ size = 'md' }: { size?: LogoSize }) {
  const { width, height } = SIZES[size]

  return (
    <Link href="/" className="inline-block">
      <Image
        src="/votu_logo.svg"
        alt="votu"
        width={width}
        height={height}
        priority
        style={{ height: 'auto' }}
      />
    </Link>
  )
}
