import { CardContent } from "@/components/ui/card"
import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { SongHistory } from "@/components/song-history"
import { RequestForm } from "@/components/request-form"
import { ActiveUsersFooter } from "@/components/active-users-footer"
import { UpcomingShows } from "@/components/upcoming-shows"
import { Button } from "@/components/ui/button"
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

async function getUpcomingShows() {
  try {
    const now = new Date()
    const currentDay = now.getDay()
    const currentTime = now.toTimeString().slice(0, 8)
    const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000)

    const shows: any[] = await query(
      `SELECT 
        s.id, s.title, s.description, s.day_of_week, s.start_time, s.end_time,
        u.id as user_id, u.username, u.first_name, u.last_name, u.avatar_url, u.staff_role
      FROM schedule s
      INNER JOIN users u ON s.user_id = u.id
      WHERE s.is_active = TRUE
        AND s.is_recurring = TRUE
        AND s.day_of_week = ?
        AND s.start_time >= ?
        AND s.start_time <= TIME(?)
      ORDER BY s.start_time ASC
      LIMIT 10`,
      [currentDay, currentTime, threeHoursFromNow.toTimeString().slice(0, 8)],
    )

    return shows
  } catch (error) {
    console.error("[v0] Failed to fetch upcoming shows:", error)
    return []
  }
}

async function getLatestArticle() {
  try {
    const articles: any[] = await query(
      `SELECT 
        a.id, a.title, a.slug, a.excerpt, a.featured_image, a.published_at,
        u.username, u.first_name, u.last_name, u.avatar_url
      FROM articles a
      INNER JOIN users u ON a.user_id = u.id
      WHERE a.approval_status = 'approved'
      ORDER BY a.published_at DESC
      LIMIT 1`,
    )

    return articles.length > 0 ? articles[0] : null
  } catch (error) {
    console.error("[v0] Failed to fetch latest article:", error)
    return null
  }
}

export default async function HomePage() {
  const livePresenter = await getLivePresenter()
  const upcomingShows = await getUpcomingShows()
  const latestArticle = await getLatestArticle()

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 space-y-8">
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
              <Link href={`/user/${livePresenter.username}`}>
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

        {latestArticle && (
          <Card>
            <CardHeader>
              <CardTitle>Latest News</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/news/${latestArticle.slug}`}>
                <div className="flex flex-col md:flex-row gap-4 hover:shadow-md transition-shadow cursor-pointer">
                  {latestArticle.featured_image && (
                    <img
                      src={latestArticle.featured_image || "/placeholder.svg"}
                      alt={latestArticle.title}
                      className="w-full md:w-48 h-48 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2">{latestArticle.title}</h3>
                    <p className="text-muted-foreground mb-2">{latestArticle.excerpt}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {latestArticle.avatar_url && (
                        <img
                          src={latestArticle.avatar_url || "/placeholder.svg"}
                          alt={latestArticle.username}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span>
                        {latestArticle.first_name && latestArticle.last_name
                          ? `${latestArticle.first_name} ${latestArticle.last_name}`
                          : latestArticle.username}
                      </span>
                      <span>•</span>
                      <span>{new Date(latestArticle.published_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        )}

        <UpcomingShows shows={upcomingShows} />

        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Become a Presenter</h3>
          <p className="text-blue-100 mb-4">
            Join our team and share your passion for music with listeners around the world.
          </p>
          <Link href="/register">
            <Button variant="secondary">Get Started</Button>
          </Link>
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
