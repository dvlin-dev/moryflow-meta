import { useState, useEffect } from 'react'

// 获取初始值，避免首次渲染时的状态不一致
function getInitialValue(breakpoint: number): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < breakpoint
}

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => getInitialValue(breakpoint))

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // 确保初始值正确（SSR 场景）
    checkMobile()

    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [breakpoint])

  return isMobile
}
