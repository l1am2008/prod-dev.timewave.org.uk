import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
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

  const decoded = await verifyToken(token)
  if (!decoded || (decoded.role !== "admin" && decoded.role !== "super_admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const status = request.nextUrl.searchParams.get("status") || "pending"

    const articles: any[] = await query(
      `SELECT 
        a.id, a.title, a.slug, a.excerpt, a.approval_status, a.created_at, a.published_at,
        u.username, u.first_name, u.last_name
      FROM articles a
      INNER JOIN users u ON a.user_id = u.id
      WHERE a.approval_status = ?
      ORDER BY a.created_at DESC`,
      [status],
    )

    return NextResponse.json({ articles })
  } catch (error) {
    console.error("[v0] Failed to fetch articles:", error)
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 })
  }
}
