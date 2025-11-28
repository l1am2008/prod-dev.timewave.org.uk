import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const users: any[] = await query(`SELECT can_create_shows, can_create_articles, role FROM users WHERE id = ?`, [
      user.id,
    ])

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const permissions = users[0]
    const isAdmin = permissions.role === "admin" || permissions.role === "super_admin"

    return NextResponse.json({
      can_create_shows: permissions.can_create_shows || isAdmin,
      can_create_articles: permissions.can_create_articles || isAdmin,
    })
  } catch (error) {
    console.error("[v0] Failed to fetch permissions:", error)
    return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 })
  }
}
