"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, Settings, LayoutDashboard } from "lucide-react"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.push("/login")
    }
  }, [pathname, router])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://us-east-1.tixte.net/uploads/liam.needs.rest/TimewaveTransparent.png"
              alt="Timewave Radio"
              className="h-10 w-10"
            />
            <div>
              <h1 className="text-xl font-bold">User Portal</h1>
              <p className="text-xs text-muted-foreground">Timewave Radio</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Site
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 border-r border-border bg-card min-h-[calc(100vh-73px)]">
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
