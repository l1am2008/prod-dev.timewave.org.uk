import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { PersistentPlayer } from "@/components/persistent-player"
import { SiteHeader } from "@/components/site-header"
import { Toaster } from "@/components/ui/sonner"
import { ActiveUsersFooter } from "@/components/active-users-footer"
import { ThemeEffects } from "@/components/theme-effects"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Timewave Radio",
  description: "Listen to the best music on Timewave Radio | Broadcasting 24/7",
  icons: {
    icon: "https://us-east-1.tixte.net/uploads/liam.needs.rest/TimewaveTransparent.png",
  },
    generator: 'v0.app'
}

async function getActiveTheme() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    console.log("[v0] Fetching theme from:", `${baseUrl}/api/admin/settings/theme`)

    const response = await fetch(`${baseUrl}/api/admin/settings/theme`, {
      cache: "no-store",
      next: { revalidate: 0 },
    })

    if (!response.ok) {
      console.error("[v0] Theme fetch failed with status:", response.status)
      return "default"
    }

    const data = await response.json()
    console.log("[v0] Active theme:", data.theme)
    return data.theme || "default"
  } catch (error) {
    console.error("[v0] Failed to fetch theme:", error)
    return "default"
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const activeTheme = await getActiveTheme()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <SiteHeader />
          <PersistentPlayer />
          {children}
          <ActiveUsersFooter />
          <ThemeEffects theme={activeTheme} />
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
