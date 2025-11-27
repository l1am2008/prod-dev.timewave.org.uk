import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const vips = await query(
      `SELECT 
        u.id, u.username, u.first_name, u.last_name, u.bio, 
        u.avatar_url, u.role, u.staff_role, u.is_vip,
        (SELECT COUNT(*) FROM live_sessions WHERE user_id = u.id) as total_shows,
        (SELECT is_live FROM live_sessions WHERE user_id = u.id AND is_live = TRUE LIMIT 1) as is_live
      FROM users u
      WHERE u.is_vip = TRUE
      ORDER BY u.vip_granted_at DESC`,
    )

    return NextResponse.json(vips)
  } catch (error) {
    console.error("[v0] Failed to fetch VIPs:", error)
    return NextResponse.json({ error: "Failed to fetch VIPs" }, { status: 500 })
  }
}
