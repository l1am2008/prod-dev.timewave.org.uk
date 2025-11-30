import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const liveSessions: any[] = await query(
      `SELECT 
        u.id, u.username, u.first_name, u.last_name, u.avatar_url, u.staff_role,
        ls.id as session_id, ls.encoder_id, ls.started_at, ls.listeners_peak, ls.is_live
      FROM live_sessions ls
      INNER JOIN users u ON ls.user_id = u.id
      WHERE ls.is_live = TRUE
      ORDER BY ls.started_at DESC
      LIMIT 1`,
    )

    if (liveSessions.length > 0) {
      return NextResponse.json({ is_live: true, presenter: liveSessions[0] })
    }

    return NextResponse.json({ is_live: false, presenter: null })
  } catch (error) {
    console.error("[Cymatic Group] Failed to fetch live presenter:", error)
    return NextResponse.json({ error: "Failed to fetch live presenter" }, { status: 500 })
  }
}
