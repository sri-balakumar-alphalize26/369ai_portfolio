'use client'

import { useEffect, useRef } from 'react'

/**
 * Marks its subtree with data-marquee-inview while any part of it is on
 * screen. The marquee tracks are paused by default in CSS and run only under
 * this attribute — an infinite animation off-screen still burns compositor
 * cycles on mobile.
 */
export function MarqueeInView({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        el.setAttribute('data-marquee-inview', String(entry.isIntersecting))
      },
      { threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={className} data-marquee-inview="false">
      {children}
    </div>
  )
}
