"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, Settings, LayoutDashboard } from "lucide-react"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [showSidebar, setShowSidebar] = useState(false)
  const [currentUsername, setCurrentUsername] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
      return
    }

    fetchCurrentUser()
    checkIfShouldShowSidebar()
  }, [pathname, router])

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const response = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentUsername(data.username)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch current user:", error)
    }
  }

  const checkIfShouldShowSidebar = () => {
    // Hide sidebar for /user/[username] unless it's your own username
    const isOwnProfile = pathname === "/user" || pathname === "/user/profile" || pathname === "/user/settings"
    const isViewingOtherProfile = pathname.startsWith("/user/") && !isOwnProfile

    if (isViewingOtherProfile) {
      // Check if viewing own username
      const usernameMatch = pathname.match(/\/user\/([^/]+)/)
      if (usernameMatch && currentUsername && usernameMatch[1] === currentUsername) {
        setShowSidebar(true)
      } else {
        setShowSidebar(false)
      }
    } else {
      setShowSidebar(true)
    }
  }

  useEffect(() => {
    checkIfShouldShowSidebar()
  }, [pathname, currentUsername])

  if (!showSidebar) {
    return <main className="min-h-screen bg-background p-8">{children}</main>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-64 border-r border-border bg-card min-h-screen">
          <nav className="p-4 space-y-2">
            <Link href="/user">
              <Button variant="ghost" className="w-full justify-start">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/user/profile">
              <Button variant="ghost" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                My Profile
              </Button>
            </Link>
            <Link href="/user/settings">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
