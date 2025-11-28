import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    if (!token) {
      console.log("[v0] No auth token found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      console.log("[v0] Invalid token")
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    console.log("[v0] Fetching permissions for user:", user.id)

    const users: any[] = await query(`SELECT can_create_shows, can_create_articles, role FROM users WHERE id = ?`, [
      user.id,
    ])

    if (users.length === 0) {
      console.log("[v0] User not found in database")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const permissions = users[0]
    console.log("[v0] User permissions from DB:", permissions)
    const isAdmin = permissions.role === "admin" || permissions.role === "super_admin"

    const response = {
      can_create_shows: permissions.can_create_shows || isAdmin,
      can_create_articles: permissions.can_create_articles || isAdmin,
    }
    console.log("[v0] Returning permissions:", response)

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Failed to fetch permissions:", error)
    return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 })
  }
}
