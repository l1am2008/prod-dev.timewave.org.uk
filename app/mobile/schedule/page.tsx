import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, User, Calendar, Radio, Newspaper, UsersIcon } from "lucide-react"
import { query } from "@/lib/db"
import Link from "next/link"

interface ScheduleEvent {
  id: number
  title: string
  description: string
  day_of_week: number
  start_time: string
  end_time: string
  username: string
  first_name: string
  last_name: string
  avatar_url: string
}

async function getSchedule() {
  try {
    const schedule: ScheduleEvent[] = await query(
      `SELECT 
        s.id, s.title, s.description, s.day_of_week, s.start_time, s.end_time,
        u.username, u.first_name, u.last_name, u.avatar_url
      FROM schedule s
      INNER JOIN users u ON s.user_id = u.id
      WHERE s.is_active = TRUE
      ORDER BY s.day_of_week ASC, s.start_time ASC`,
    )
    return schedule
  } catch (error) {
    return []
  }
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function MobileSchedulePage() {
  const schedule = await getSchedule()
  const scheduleByDay: Record<number, ScheduleEvent[]> = {}

  schedule.forEach((event) => {
    if (!scheduleByDay[event.day_of_week]) {
      scheduleByDay[event.day_of_week] = []
    }
    scheduleByDay[event.day_of_week].push(event)
  })

  const today = new Date().getDay()

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule
        </h1>
      </header>

      <main className="p-4 space-y-4">
        {daysOfWeek.map((day, dayIndex) => (
          <div key={dayIndex}>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="font-bold">{day}</h2>
              {dayIndex === today && <Badge variant="default">Today</Badge>}
            </div>

            {scheduleByDay[dayIndex] && scheduleByDay[dayIndex].length > 0 ? (
              <div className="space-y-2">
                {scheduleByDay[dayIndex].map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        {event.avatar_url ? (
                          <img
                            src={event.avatar_url || "/placeholder.svg"}
                            alt={event.username}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-5 w-5" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{event.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1">{event.description}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {event.start_time} - {event.end_time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No shows</p>
            )}
          </div>
        ))}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 flex justify-around">
        <Link href="/mobile" className="flex flex-col items-center gap-1 text-muted-foreground">
          <Radio className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </Link>
        <Link href="/mobile/schedule" className="flex flex-col items-center gap-1">
          <Calendar className="h-5 w-5" />
          <span className="text-xs">Schedule</span>
        </Link>
        <Link href="/mobile/news" className="flex flex-col items-center gap-1 text-muted-foreground">
          <Newspaper className="h-5 w-5" />
          <span className="text-xs">News</span>
        </Link>
        <Link href="/mobile/community" className="flex flex-col items-center gap-1 text-muted-foreground">
          <UsersIcon className="h-5 w-5" />
          <span className="text-xs">Community</span>
        </Link>
      </nav>
    </div>
  )
}
