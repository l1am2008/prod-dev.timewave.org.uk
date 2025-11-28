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

    const articles: any[] = await query(
      `SELECT id, title, slug, approval_status, rejection_reason, created_at, published_at
      FROM articles
      WHERE user_id = ?
      ORDER BY created_at DESC`,
      [user.id],
    )

    return NextResponse.json({ articles })
  } catch (error) {
    console.error("[v0] Failed to fetch articles:", error)
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 })
  }
}
