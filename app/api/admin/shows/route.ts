import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/middleware"

// GET - Fetch all shows (admin only)
export async function GET(request: NextRequest) {
  const authCheck = await requireAdmin(request)

  if (!authCheck.valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"

    let sql = `
      SELECT s.*, u.username, u.first_name, u.last_name, u.email,
             a.username as approved_by_username
      FROM schedule s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN users a ON s.approved_by = a.id
    `

    const params: any[] = []

    if (status !== "all") {
      sql += " WHERE s.approval_status = ?"
      params.push(status)
    }

    sql += " ORDER BY s.approval_status, s.day_of_week, s.start_time"

    const shows = await query(sql, params)

    return NextResponse.json(shows)
  } catch (error) {
    console.error("[v0] Failed to fetch shows:", error)
    return NextResponse.json({ error: "Failed to fetch shows" }, { status: 500 })
  }
}
