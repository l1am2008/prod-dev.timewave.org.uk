import { Radio } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface Show {
  id: number
  title: string
  description: string
  start_time: string
  end_time: string
  user_id: number
  username: string
  first_name: string
  last_name: string
  avatar_url: string
  staff_role: string
}

interface UpcomingShowsProps {
  shows: Show[]
}

export function UpcomingShows({ shows }: UpcomingShowsProps) {
  if (shows.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Radio className="h-24 w-24 mb-4 opacity-90" />
          <h3 className="text-2xl font-bold mb-2">Timewave Radio</h3>
          <p className="text-blue-100 text-center">No scheduled shows in the next 3 hours</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Shows (Next 3 Hours)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {shows.map((show) => (
          <Link key={show.id} href={`/user/${show.username}`}>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer">
              {show.avatar_url ? (
                <img
                  src={show.avatar_url || "/placeholder.svg"}
                  alt={show.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold">{show.username.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{show.title}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {show.first_name && show.last_name ? `${show.first_name} ${show.last_name}` : show.username}
                </p>
                <p className="text-xs text-muted-foreground">
                  {show.start_time.slice(0, 5)} - {show.end_time.slice(0, 5)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
