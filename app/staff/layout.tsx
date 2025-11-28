import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, Radio, History, LayoutDashboard, Music, Calendar, Newspaper } from "lucide-react"

export const metadata: Metadata = {
  title: "Staff Portal - Timewave Radio",
  description: "Manage your broadcasts and profile",
}

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <aside className="w-64 border-r border-border bg-card min-h-screen">
          <nav className="p-4 space-y-2">
            <Link href="/staff">
              <Button variant="ghost" className="w-full justify-start">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/staff/profile">
              <Button variant="ghost" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                My Profile
              </Button>
            </Link>
            <Link href="/staff/shows">
              <Button variant="ghost" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                My Shows
              </Button>
            </Link>
            <Link href="/staff/articles">
              <Button variant="ghost" className="w-full justify-start">
                <Newspaper className="h-4 w-4 mr-2" />
                My Articles
              </Button>
            </Link>
            <Link href="/staff/encoder">
              <Button variant="ghost" className="w-full justify-start">
                <Radio className="h-4 w-4 mr-2" />
                Encoder Info
              </Button>
            </Link>
            <Link href="/staff/requests">
              <Button variant="ghost" className="w-full justify-start">
                <Music className="h-4 w-4 mr-2" />
                Song Requests
              </Button>
            </Link>
            <Link href="/staff/history">
              <Button variant="ghost" className="w-full justify-start">
                <History className="h-4 w-4 mr-2" />
                Broadcast History
              </Button>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
