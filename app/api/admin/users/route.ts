import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { withAuth } from "@/lib/middleware"

export async function GET(request: NextRequest) {
  const auth = await withAuth(["admin", "super_admin"])(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""

    let sql = `
      SELECT 
        u.id, u.email, u.username, u.first_name, u.last_name, 
        u.role, u.staff_role, u.is_verified, u.newsletter_subscribed, 
        u.created_at, u.avatar_url,
        se.encoder_id, se.is_active as encoder_active
      FROM users u
      LEFT JOIN staff_encoders se ON u.id = se.user_id
      WHERE 1=1
    `

    const params: any[] = []

    if (search) {
      sql += " AND (u.username LIKE ? OR u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)"
      const searchPattern = `%${search}%`
      params.push(searchPattern, searchPattern, searchPattern, searchPattern)
    }

    if (role) {
      sql += " AND u.role = ?"
      params.push(role)
    }

    sql += " ORDER BY u.created_at DESC"

    const users = await query(sql, params)

    return NextResponse.json(users)
  } catch (error) {
    console.error("[v0] Failed to fetch users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
