"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, Mail, Settings, LayoutDashboard, Calendar, Newspaper } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== "/admin/login") {
      const token = localStorage.getItem("admin_token")
      if (!token) {
        router.push("/admin/login")
      }
    }
  }, [pathname, router])

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-64 border-r border-border bg-card min-h-screen">
          <nav className="p-4 space-y-2">
            <Link href="/admin">
              <Button variant="ghost" className="w-full justify-start">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="ghost" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                User Management
              </Button>
            </Link>
            <Link href="/admin/shows">
              <Button variant="ghost" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Show Management
              </Button>
            </Link>
            <Link href="/admin/articles">
              <Button variant="ghost" className="w-full justify-start">
                <Newspaper className="h-4 w-4 mr-2" />
                Article Management
              </Button>
            </Link>
            <Link href="/admin/newsletter">
              <Button variant="ghost" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Newsletter
              </Button>
            </Link>
            <Link href="/admin/settings">
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
