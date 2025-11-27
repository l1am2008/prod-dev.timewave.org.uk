import { NowPlayingBanner } from "@/components/now-playing-banner"
import { SongHistory } from "@/components/song-history"
import { RequestForm } from "@/components/request-form"
import { ActiveUsersFooter } from "@/components/active-users-footer"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Radio } from "lucide-react"
import Link from "next/link"
import { query } from "@/lib/db"

async function getLivePresenter() {
  try {
    const liveSessions: any[] = await query(
      `SELECT 
        u.id, u.username, u.first_name, u.last_name, u.avatar_url, u.staff_role,
        ls.started_at, ls.listeners_peak
      FROM live_sessions ls
      INNER JOIN users u ON ls.user_id = u.id
      WHERE ls.is_live = TRUE
      ORDER BY ls.started_at DESC
      LIMIT 1`,
    )

    return liveSessions.length > 0 ? liveSessions[0] : null
  } catch (error) {
    console.error("[v0] Failed to fetch live presenter:", error)
    return null
  }
}

export default async function HomePage() {
  const livePresenter = await getLivePresenter()

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="container mx-auto px-4 py-8 space-y-8">
        <NowPlayingBanner />

        {livePresenter && (
          <Card className="border-red-500 bg-red-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Live with {livePresenter.first_name || livePresenter.username}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/presenters/${livePresenter.id}`}>
                <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  {livePresenter.avatar_url ? (
                    <img
                      src={livePresenter.avatar_url || "/placeholder.svg"}
                      alt={livePresenter.username}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold">{livePresenter.username.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">
                      {livePresenter.first_name && livePresenter.last_name
                        ? `${livePresenter.first_name} ${livePresenter.last_name}`
                        : livePresenter.username}
                    </h3>
                    <p className="text-sm text-muted-foreground">{livePresenter.staff_role || "Staff Member"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Started {new Date(livePresenter.started_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button>View Profile</Button>
                </div>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Radio className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Welcome to Timewave Radio</h2>
                <p className="text-sm text-muted-foreground">
                  {"Today is "}{" "}
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <p className="text-muted-foreground">
              Broadcasting the best music 24/7. Join our community of music lovers and never miss a beat.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Become a Presenter</h3>
            <p className="text-blue-100 mb-4">
              Join our team and share your passion for music with listeners around the world.
            </p>
            <Link href="/register">
              <Button variant="secondary">Get Started</Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <SongHistory />
          <RequestForm />
        </div>
      </main>

      <ActiveUsersFooter />
    </div>
  )
}
