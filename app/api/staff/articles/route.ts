import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Staff articles API called")
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
      console.log("[v0] No auth token found in staff articles")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Verifying token for staff articles...")
    const user = await verifyToken(token)
    console.log("[v0] Token verification result:", user ? `success (user ${user.id})` : "failed")

    if (!user) {
      console.log("[v0] Invalid token in staff articles")
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    console.log("[v0] Fetching articles for user:", user.id)
    const articles: any[] = await query(
      `SELECT id, title, slug, approval_status, rejection_reason, created_at, published_at
      FROM articles
      WHERE user_id = ?
      ORDER BY created_at DESC`,
      [user.id],
    )

    console.log("[v0] Found", articles.length, "articles for user")

    return NextResponse.json({ articles })
  } catch (error) {
    console.error("[v0] Failed to fetch articles:", error)
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 })
  }
}
