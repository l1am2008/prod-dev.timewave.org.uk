"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

export function MobileRedirect() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (
      pathname?.startsWith("/mobile") ||
      pathname?.startsWith("/admin") ||
      pathname?.startsWith("/staff") ||
      pathname?.startsWith("/user")
    ) {
      return
    }

    const mobilePattern = /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i
    const userAgent = navigator.userAgent
    const screenWidth = window.innerWidth
    const isMobileDevice = mobilePattern.test(userAgent)
    const isSmallScreen = screenWidth < 768
    const isMobile = isMobileDevice || isSmallScreen

    if (isMobile) {
      const mobileRoutes: Record<string, string> = {
        "/": "/mobile",
        "/schedule": "/mobile/schedule",
        "/news": "/mobile/news",
        "/community": "/mobile/community",
      }

      const mobileRoute = mobileRoutes[pathname || "/"]
      if (mobileRoute) {
        router.replace(mobileRoute)
      }
    }
  }, [pathname, router])

  return null
}
