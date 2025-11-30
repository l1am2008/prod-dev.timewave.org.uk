import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Permissions API called")
    let token = request.cookies.get("auth_token")?.value

    if (!token) {
      const authHeader = request.headers.get("authorization")
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7)
        console.log("[v0] Token found in Authorization header")
      }
    } else {
      console.log("[v0] Token found in cookies")
    }

    console.log("[v0] Auth token present:", !!token)

    if (!token) {
      console.log("[v0] No auth token found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Attempting to verify token...")
    const user = await verifyToken(token)
    console.log("[v0] Token verification result:", user ? "success" : "failed")

    if (!user) {
      console.log("[v0] Invalid token")
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    console.log("[v0] Fetching permissions for user:", user.id, "role:", user.role)

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
    console.log("[v0] Is admin:", isAdmin)

    const response = {
      can_create_shows: Boolean(permissions.can_create_shows) || isAdmin,
      can_create_articles: Boolean(permissions.can_create_articles) || isAdmin,
    }
    console.log("[v0] Returning permissions:", response)

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Failed to fetch permissions:", error)
    return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 })
  }
}
