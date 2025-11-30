import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    const users = await query(
      `SELECT 
        u.id, u.username, u.first_name, u.last_name, 
        u.avatar_url, u.role
      FROM users u
      WHERE u.is_verified = TRUE
      ORDER BY u.created_at DESC
      LIMIT 100`,
    )

    return NextResponse.json(users || [])
  } catch (error) {
    console.error("[Cymatic Group] Failed to fetch all users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
