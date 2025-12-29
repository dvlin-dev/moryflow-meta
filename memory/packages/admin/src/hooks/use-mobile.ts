import * as React from 'react'

const MOBILE_BREAKPOINT = 768

/**
 * 检测当前是否为移动端视口
 * SSR 安全：服务端返回 false，客户端首次渲染后同步更新
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(() => {
    // SSR 安全检查
    if (typeof window === 'undefined') return false
    return window.innerWidth < MOBILE_BREAKPOINT
  })

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
