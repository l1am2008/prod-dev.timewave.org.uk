import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    console.log("[v0] Fetching live presenter...")

    const liveSessions: any[] = await query(
      `SELECT 
        u.id, u.username, u.first_name, u.last_name, u.avatar_url, u.staff_role,
        ls.id as session_id, ls.encoder_id, ls.started_at, ls.listeners_peak
      FROM live_sessions ls
      INNER JOIN users u ON ls.user_id = u.id
      WHERE ls.is_live = TRUE
      ORDER BY ls.started_at DESC
      LIMIT 1`,
    )

    console.log("[v0] Live sessions found:", liveSessions.length)
    if (liveSessions.length > 0) {
      console.log("[v0] Live presenter data:", liveSessions[0])
    }

    if (liveSessions.length === 0) {
      return NextResponse.json({ is_live: false, presenter: null })
    }

    return NextResponse.json({ is_live: true, presenter: liveSessions[0] })
  } catch (error) {
    console.error("[v0] Failed to fetch live presenter:", error)
    return NextResponse.json({ error: "Failed to fetch live presenter" }, { status: 500 })
  }
}
