import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    console.log("[v0] Fetching staff users for community page")

    const staff = await query(
      `SELECT 
        u.id, u.username, u.first_name, u.last_name, 
        u.avatar_url, u.role
      FROM users u
      WHERE u.role IN ('staff', 'admin', 'super_admin')
      ORDER BY u.username ASC`,
    )

    console.log("[v0] Found staff:", staff?.length || 0)
    return NextResponse.json(staff || [])
  } catch (error) {
    console.error("[v0] Failed to fetch staff:", error)
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 })
  }
}
