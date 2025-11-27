import { query } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Radio } from "lucide-react"
import Link from "next/link"

async function getPresenters() {
  try {
    const presenters = await query(
      `SELECT 
        u.id, u.username, u.first_name, u.last_name, u.bio, 
        u.avatar_url, u.staff_role,
        (SELECT COUNT(*) FROM live_sessions WHERE user_id = u.id) as total_shows,
        (SELECT is_live FROM live_sessions WHERE user_id = u.id AND is_live = TRUE LIMIT 1) as is_live
      FROM users u
      WHERE u.role = 'staff'
      ORDER BY u.username ASC`,
    )

    return presenters
  } catch (error) {
    console.error("[v0] Failed to fetch presenters:", error)
    return []
  }
}

export default async function PresentersPage() {
  const presenters: any[] = await getPresenters()

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
            <Link href="/">
              <button className="text-sm hover:underline">Home</button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Our Presenters</h2>
          <p className="text-muted-foreground">Meet the talented team behind Timewave Radio</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {presenters.map((presenter) => (
            <Link key={presenter.id} href={`/presenters/${presenter.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {presenter.avatar_url ? (
                        <img
                          src={presenter.avatar_url || "/placeholder.svg"}
                          alt={presenter.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-bold">{presenter.username.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">
                          {presenter.first_name && presenter.last_name
                            ? `${presenter.first_name} ${presenter.last_name}`
                            : presenter.username}
                        </CardTitle>
                        <CardDescription className="text-sm">@{presenter.username}</CardDescription>
                      </div>
                    </div>
                    {presenter.is_live && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        LIVE
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {presenter.staff_role && (
                    <p className="text-sm font-medium text-primary mb-2">{presenter.staff_role}</p>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {presenter.bio || "No bio available"}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Radio className="h-3 w-3" />
                    <span>{presenter.total_shows} shows</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {presenters.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No presenters available yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
