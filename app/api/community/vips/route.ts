import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("[v0] Fetching VIP users for community page")

    // Once migration 05-add-vip-system.sql is executed, uncomment the query below
    /*
    const vips = await query(
      `SELECT 
        u.id, u.username, u.first_name, u.last_name, 
        u.avatar_url, u.role, u.is_vip, u.vip_granted_at
      FROM users u
      WHERE u.is_vip = TRUE
      ORDER BY u.vip_granted_at DESC`,
    )
    return NextResponse.json(vips || [])
    */

    console.log("[v0] VIP system not yet migrated, returning empty array")
    return NextResponse.json([])
  } catch (error) {
    console.error("[v0] Failed to fetch VIPs:", error)
    return NextResponse.json({ error: "Failed to fetch VIPs" }, { status: 500 })
  }
}
