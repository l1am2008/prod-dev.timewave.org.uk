import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const liveSessions: any[] = await query(
      `SELECT 
        ls.id, ls.started_at, ls.listeners_peak,
        u.id as user_id, u.username, u.first_name, u.last_name, 
        u.bio, u.avatar_url, u.staff_role
      FROM live_sessions ls
      INNER JOIN users u ON ls.user_id = u.id
      WHERE ls.is_live = TRUE
      ORDER BY ls.started_at DESC
      LIMIT 1`,
    )

    if (liveSessions.length === 0) {
      return NextResponse.json({ is_live: false })
    }

    return NextResponse.json({
      is_live: true,
      session: liveSessions[0],
    })
  } catch (error) {
    console.error("[v0] Failed to fetch current live session:", error)
    return NextResponse.json({ error: "Failed to fetch live session" }, { status: 500 })
  }
}
