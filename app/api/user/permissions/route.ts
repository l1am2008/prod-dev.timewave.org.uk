import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    let token = request.cookies.get("auth_token")?.value

    if (!token) {
      const authHeader = request.headers.get("authorization")
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7)
      }
    }

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

    const response = {
      can_create_shows: Boolean(permissions.can_create_shows) || isAdmin,
      can_create_articles: Boolean(permissions.can_create_articles) || isAdmin,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[Cymatic Group] Failed to fetch permissions:", error)
    return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 })
  }
}
