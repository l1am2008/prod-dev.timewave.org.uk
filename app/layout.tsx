import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { PersistentPlayer } from "@/components/persistent-player"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Timewave Radio - Broadcasting 24/7",
  description: "Listen to the best music on Timewave Radio",
  generator: "v0.app",
  icons: {
    icon: "https://us-east-1.tixte.net/uploads/liam.needs.rest/TimewaveTransparent.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <PersistentPlayer />
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
