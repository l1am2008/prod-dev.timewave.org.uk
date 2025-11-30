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
import { SiteFooter } from "@/components/site-footer"
import { query } from "@/lib/db"
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
    const result = await query("SELECT setting_value FROM site_settings WHERE setting_key = 'active_theme'")
    const theme = result.length > 0 ? result[0].setting_value : "default"
    return theme
  } catch (error) {
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
          <SiteFooter />
          <ThemeEffects theme={activeTheme} />
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
