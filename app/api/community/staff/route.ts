import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const staff = await query(
      `SELECT 
        u.id, u.username, u.first_name, u.last_name, 
        u.avatar_url, u.role
      FROM users u
      WHERE u.role IN ('staff', 'admin', 'super_admin')
      ORDER BY u.username ASC`,
    )

    return NextResponse.json(staff || [])
  } catch (error) {
    console.error("[Cymatic Group] Failed to fetch staff:", error)
    return NextResponse.json({ error: "Failed to fetch staff" }, { status: 500 })
  }
}
