import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const now = new Date()
    const currentDay = now.getDay()
    const currentTime = now.toTimeString().slice(0, 8)
    const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000)

    const upcomingShows: any[] = await query(
      `SELECT 
        s.id, s.title, s.description, s.day_of_week, s.start_time, s.end_time,
        u.id as user_id, u.username, u.first_name, u.last_name, u.avatar_url, u.staff_role
      FROM schedule s
      INNER JOIN users u ON s.user_id = u.id
      WHERE s.is_active = TRUE
        AND s.is_recurring = TRUE
        AND s.approval_status = 'approved'
        AND s.day_of_week = ?
        AND s.start_time >= ?
        AND s.start_time <= TIME(?)
      ORDER BY s.start_time ASC
      LIMIT 10`,
      [currentDay, currentTime, threeHoursFromNow.toTimeString().slice(0, 8)],
    )

    return NextResponse.json({ shows: upcomingShows })
  } catch (error) {
    console.error("[v0] Failed to fetch upcoming shows:", error)
    return NextResponse.json({ error: "Failed to fetch upcoming shows" }, { status: 500 })
  }
}
