import { useState, useEffect } from 'react'

export type Breakpoint = 'xl' | 'lg' | 'md' | 'sm' | 'xs'

const BREAKPOINTS: [Breakpoint, number][] = [
  ['xl', 1600],
  ['lg', 1200],
  ['md', 992],
  ['sm', 768],
  ['xs', 0],
]

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>('xl')

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      for (const [name, min] of BREAKPOINTS) {
        if (w >= min) { setBp(name); break }
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return bp
}

// 是否移动端（手机）
export function useIsMobile() {
  const bp = useBreakpoint()
  return bp === 'xs' || bp === 'sm'
}

// 是否平板
export function useIsTablet() {
  const bp = useBreakpoint()
  return bp === 'sm' || bp === 'md'
}
