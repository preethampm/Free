'use client'

import { useEffect, useRef } from 'react'

export function ScrollReveal({
  children,
  className = '',
  animation = 'reveal',
}: {
  children: React.ReactNode
  className?: string
  animation?: 'reveal' | 'reveal-left' | 'reveal-scale'
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`${animation} ${className}`}>
      {children}
    </div>
  )
}
