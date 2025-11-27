import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/middleware"

export async function GET(request: Request) {
  try {
    const authResult = await verifyToken(request)
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users: any[] = await query(
      `SELECT id, username, email, first_name, last_name, avatar_url, role, created_at
       FROM users WHERE id = ?`,
      [authResult.user.id],
    )

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(users[0])
  } catch (error) {
    console.error("[v0] Profile fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
