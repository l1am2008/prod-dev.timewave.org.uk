import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User } from "lucide-react"
import { query } from "@/lib/db"

interface ScheduleEvent {
  id: number
  title: string
  description: string
  day_of_week: number
  start_time: string
  end_time: string
  user_id: number
  username: string
  first_name: string
  last_name: string
  avatar_url: string
  is_recurring: boolean
}

async function getSchedule() {
  try {
    const schedule: ScheduleEvent[] = await query(
      `SELECT 
        s.id, s.title, s.description, s.day_of_week, s.start_time, s.end_time, s.is_recurring,
        s.user_id, u.username, u.first_name, u.last_name, u.avatar_url
      FROM schedule s
      INNER JOIN users u ON s.user_id = u.id
      WHERE s.is_active = TRUE
      ORDER BY s.day_of_week ASC, s.start_time ASC`,
    )
    return schedule
  } catch (error) {
    console.error("[v0] Failed to fetch schedule:", error)
    return []
  }
}

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function SchedulePage() {
  const schedule = await getSchedule()

  // Group schedule by day
  const scheduleByDay: Record<number, ScheduleEvent[]> = {}
  schedule.forEach((event) => {
    if (!scheduleByDay[event.day_of_week]) {
      scheduleByDay[event.day_of_week] = []
    }
    scheduleByDay[event.day_of_week].push(event)
  })

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Weekly Schedule
          </h2>
          <p className="text-muted-foreground">Check out what's playing this week on Timewave Radio</p>
        </div>

        <div className="space-y-6">
          {daysOfWeek.map((day, dayIndex) => (
            <Card key={dayIndex}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {day}
                  {dayIndex === new Date().getDay() && (
                    <Badge variant="default" className="ml-2">
                      Today
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scheduleByDay[dayIndex] && scheduleByDay[dayIndex].length > 0 ? (
                  <div className="space-y-3">
                    {scheduleByDay[dayIndex].map((event) => (
                      <div key={event.id} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                        <div className="flex-shrink-0">
                          {event.avatar_url ? (
                            <img
                              src={event.avatar_url || "/placeholder.svg"}
                              alt={event.username}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{event.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                {event.start_time} - {event.end_time}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>
                                {event.first_name && event.last_name
                                  ? `${event.first_name} ${event.last_name}`
                                  : event.username}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No shows scheduled for this day</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
