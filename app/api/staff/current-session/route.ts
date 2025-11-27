import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { withAuth } from "@/lib/middleware"

export async function GET(request: NextRequest) {
  const auth = await withAuth(["staff", "admin", "super_admin"])(request)
  if (auth instanceof NextResponse) return auth

  try {
    const sessions: any[] = await query(
      `SELECT 
        id, encoder_id, started_at, is_live, listeners_peak
      FROM live_sessions
      WHERE user_id = ? AND is_live = TRUE
      ORDER BY started_at DESC
      LIMIT 1`,
      [auth.user.id],
    )

    if (sessions.length === 0) {
      return NextResponse.json({ is_live: false })
    }

    return NextResponse.json({ is_live: true, session: sessions[0] })
  } catch (error) {
    console.error("[v0] Failed to fetch current session:", error)
    return NextResponse.json({ error: "Failed to fetch current session" }, { status: 500 })
  }
}
