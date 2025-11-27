"use client"

import { useEffect, useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Users, User, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface UserRole {
  role: string
  username: string
}

export function SiteHeader() {
  const [user, setUser] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    console.log("[v0] SiteHeader checking auth, token exists:", !!token)

    if (token) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          console.log("[v0] Auth check response status:", res.status)
          if (!res.ok) {
            throw new Error("Auth failed")
          }
          return res.json()
        })
        .then((data) => {
          console.log("[v0] User data received:", data)
          if (data.role && data.username) {
            setUser({ role: data.role, username: data.username })
          }
          setLoading(false)
        })
        .catch((error) => {
          console.error("[v0] Auth check failed:", error)
          localStorage.removeItem("auth_token")
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogout = () => {
    console.log("[v0] Logging out")
    localStorage.removeItem("auth_token")
    setUser(null)
    router.push("/")
    router.refresh()
  }

  const getPortalLinks = () => {
    if (!user) return []
    const links = []

    // All logged-in users get User Editor
    links.push({ label: "User Editor", href: "/user/profile", icon: User })

    // Staff members get Presenter Portal
    if (user.role === "staff" || user.role === "admin" || user.role === "super_admin") {
      links.push({ label: "Presenter Portal", href: "/staff", icon: Users })
    }

    // Admins get Admin Portal
    if (user.role === "super_admin" || user.role === "admin") {
      links.push({ label: "Admin Portal", href: "/admin", icon: Settings })
    }

    return links
  }

  const portalLinks = getPortalLinks()

  return (
    <header className="border-b border-border bg-card sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="https://us-east-1.tixte.net/uploads/liam.needs.rest/TimewaveTransparent.png"
            alt="Timewave Radio"
            className="h-10 w-10"
          />
          <h1 className="text-2xl font-bold">Timewave Radio</h1>
        </Link>

        <nav className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/schedule">
            <Button variant="ghost" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </Link>
          <Link href="/community">
            <Button variant="ghost" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Community
            </Button>
          </Link>

          {loading ? (
            <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {user.username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {portalLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} className="cursor-pointer">
                      <link.icon className="h-4 w-4 mr-2" />
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/register">
                <Button variant="outline" size="sm">
                  Register
                </Button>
              </Link>
              <Link href="/login">
                <Button size="sm">Login</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
