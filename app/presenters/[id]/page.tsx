import { query } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Radio, Calendar, TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

async function getPresenter(id: string) {
  try {
    const presenters: any[] = await query(
      `SELECT 
        u.id, u.username, u.first_name, u.last_name, u.bio, 
        u.avatar_url, u.staff_role, u.created_at,
        (SELECT COUNT(*) FROM live_sessions WHERE user_id = u.id) as total_shows,
        (SELECT SUM(TIMESTAMPDIFF(MINUTE, started_at, ended_at)) FROM live_sessions WHERE user_id = u.id AND ended_at IS NOT NULL) as total_minutes,
        (SELECT MAX(listeners_peak) FROM live_sessions WHERE user_id = u.id) as max_listeners,
        (SELECT is_live FROM live_sessions WHERE user_id = u.id AND is_live = TRUE LIMIT 1) as is_live
      FROM users u
      WHERE u.id = ? AND u.role = 'staff'`,
      [id],
    )

    if (presenters.length === 0) {
      return null
    }

    return presenters[0]
  } catch (error) {
    console.error("[v0] Failed to fetch presenter:", error)
    return null
  }
}

async function getRecentShows(userId: string) {
  try {
    const shows = await query(
      `SELECT id, started_at, ended_at, listeners_peak, is_live
       FROM live_sessions
       WHERE user_id = ?
       ORDER BY started_at DESC
       LIMIT 10`,
      [userId],
    )

    return shows
  } catch (error) {
    console.error("[v0] Failed to fetch recent shows:", error)
    return []
  }
}

export default async function PresenterDetailPage({ params }: { params: { id: string } }) {
  const presenter: any = await getPresenter(params.id)

  if (!presenter) {
    notFound()
  }

  const recentShows: any[] = await getRecentShows(params.id)

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "0h"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const totalHours = presenter.total_minutes ? Math.round(presenter.total_minutes / 60) : 0

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
            <h1 className="text-2xl font-bold">Timewave Radio</h1>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/presenters">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                All Presenters
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Presenter Header */}
        <div className="mb-8">
          <div className="flex items-start gap-6">
            {presenter.avatar_url ? (
              <img
                src={presenter.avatar_url || "/placeholder.svg"}
                alt={presenter.username}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl font-bold">{presenter.username.charAt(0).toUpperCase()}</span>
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold">
                  {presenter.first_name && presenter.last_name
                    ? `${presenter.first_name} ${presenter.last_name}`
                    : presenter.username}
                </h2>
                {presenter.is_live && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE NOW
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-1">@{presenter.username}</p>
              {presenter.staff_role && <p className="text-sm font-medium text-primary mb-4">{presenter.staff_role}</p>}
              {presenter.bio && <p className="text-muted-foreground max-w-2xl">{presenter.bio}</p>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Shows</CardTitle>
              <Radio className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{presenter.total_shows}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Broadcast Hours</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHours}h</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Listeners</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{presenter.max_listeners || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Shows */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Shows</CardTitle>
          </CardHeader>
          <CardContent>
            {recentShows.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No shows yet</p>
            ) : (
              <div className="space-y-3">
                {recentShows.map((show) => (
                  <div key={show.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">
                        {new Date(show.started_at).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(show.started_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {show.ended_at && (
                          <>
                            {" - "}
                            {new Date(show.ended_at).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Peak Listeners</p>
                        <p className="font-bold">{show.listeners_peak}</p>
                      </div>
                      {show.is_live && <Badge variant="destructive">LIVE</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
