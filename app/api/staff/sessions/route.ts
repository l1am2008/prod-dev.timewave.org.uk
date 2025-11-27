import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { withAuth } from "@/lib/middleware"

export async function GET(request: NextRequest) {
  const auth = await withAuth(["staff", "admin", "super_admin"])(request)
  if (auth instanceof NextResponse) return auth

  try {
    const sessions = await query(
      `SELECT 
        id, encoder_id, started_at, ended_at, is_live, listeners_peak
      FROM live_sessions
      WHERE user_id = ?
      ORDER BY started_at DESC
      LIMIT 50`,
      [auth.user.id],
    )

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("[v0] Failed to fetch sessions:", error)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}
