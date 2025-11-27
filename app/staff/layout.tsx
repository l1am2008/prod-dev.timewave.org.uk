import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { User, Radio, History, LayoutDashboard } from "lucide-react"

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
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://us-east-1.tixte.net/uploads/liam.needs.rest/TimewaveTransparent.png"
              alt="Timewave Radio"
              className="h-10 w-10"
            />
            <div>
              <h1 className="text-xl font-bold">Staff Portal</h1>
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
            <Link href="/staff/encoder">
              <Button variant="ghost" className="w-full justify-start">
                <Radio className="h-4 w-4 mr-2" />
                Encoder Info
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
