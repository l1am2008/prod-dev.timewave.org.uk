import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const staff = await query(
      `SELECT 
        u.id, u.username, u.first_name, u.last_name, u.bio, 
        u.avatar_url, u.role, u.staff_role, u.is_vip,
        (SELECT COUNT(*) FROM live_sessions WHERE user_id = u.id) as total_shows,
        (SELECT is_live FROM live_sessions WHERE user_id = u.id AND is_live = TRUE LIMIT 1) as is_live
      FROM users u
      WHERE u.role IN ('staff', 'admin', 'super_admin')
      ORDER BY u.is_vip DESC, u.username ASC`,
    )

    return NextResponse.json(staff)
  } catch (error) {
    console.error("[v0] Failed to fetch staff:", error)
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 })
  }
}
