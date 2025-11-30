import { Card, CardContent } from "@/components/ui/card"
import { RequestForm } from "@/components/request-form"
import Link from "next/link"
import { query } from "@/lib/db"
import { Calendar, Newspaper, Users, Radio } from "lucide-react"

async function getLivePresenter() {
  try {
    const liveSessions: any[] = await query(
      `SELECT 
        u.id, u.username, u.first_name, u.last_name, u.avatar_url,
        ls.started_at
      FROM live_sessions ls
      INNER JOIN users u ON ls.user_id = u.id
      WHERE ls.is_live = TRUE
      ORDER BY ls.started_at DESC
      LIMIT 1`,
    )
    return liveSessions.length > 0 ? liveSessions[0] : null
  } catch (error) {
    return null
  }
}

export default async function MobileHomePage() {
  const livePresenter = await getLivePresenter()

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <Link href="/mobile" className="flex items-center gap-2">
          <img
            src="https://us-east-1.tixte.net/uploads/liam.needs.rest/TimewaveTransparent.png"
            alt="Timewave Radio"
            className="h-8 w-8"
          />
          <h1 className="text-lg font-bold">Timewave Radio</h1>
        </Link>
      </header>

      <main className="p-4 space-y-4">
        {livePresenter && (
          <Card className="border-red-500 bg-red-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <div className="flex-1">
                  <p className="font-bold text-sm">Live: {livePresenter.first_name || livePresenter.username}</p>
                  <p className="text-xs text-muted-foreground">
                    Started {new Date(livePresenter.started_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Link href="/mobile/schedule">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                <Calendar className="h-8 w-8 text-primary" />
                <p className="font-semibold text-sm">Schedule</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/mobile/news">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                <Newspaper className="h-8 w-8 text-primary" />
                <p className="font-semibold text-sm">News</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/mobile/community">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                <Users className="h-8 w-8 text-primary" />
                <p className="font-semibold text-sm">Community</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/register">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                <Radio className="h-8 w-8 text-primary" />
                <p className="font-semibold text-sm">Join Us</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Card>
          <CardContent className="p-4">
            <RequestForm />
          </CardContent>
        </Card>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 flex justify-around">
        <Link href="/mobile" className="flex flex-col items-center gap-1">
          <Radio className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </Link>
        <Link href="/mobile/schedule" className="flex flex-col items-center gap-1 text-muted-foreground">
          <Calendar className="h-5 w-5" />
          <span className="text-xs">Schedule</span>
        </Link>
        <Link href="/mobile/news" className="flex flex-col items-center gap-1 text-muted-foreground">
          <Newspaper className="h-5 w-5" />
          <span className="text-xs">News</span>
        </Link>
        <Link href="/mobile/community" className="flex flex-col items-center gap-1 text-muted-foreground">
          <Users className="h-5 w-5" />
          <span className="text-xs">Community</span>
        </Link>
      </nav>
    </div>
  )
}
