import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/middleware"
import { sendShowSubmissionEmail } from "@/lib/email"

// GET - Fetch all shows for the current user
export async function GET(request: NextRequest) {
  const authCheck = await verifyToken(request)

  if (!authCheck.valid || !authCheck.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const shows: any[] = await query(
      `SELECT s.*, u.username, u.first_name, u.last_name
       FROM schedule s
       JOIN users u ON s.user_id = u.id
       WHERE s.user_id = ?
       ORDER BY s.day_of_week, s.start_time`,
      [authCheck.user.id],
    )

    return NextResponse.json(shows)
  } catch (error) {
    console.error("[v0] Failed to fetch shows:", error)
    return NextResponse.json({ error: "Failed to fetch shows" }, { status: 500 })
  }
}

// POST - Create a new show
export async function POST(request: NextRequest) {
  const authCheck = await verifyToken(request)

  if (!authCheck.valid || !authCheck.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is staff or admin
  if (!["staff", "admin", "super_admin"].includes(authCheck.user.role)) {
    return NextResponse.json({ error: "Only staff and admins can create shows" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { title, description, day_of_week, start_time, end_time, is_recurring } = body

    if (!title || day_of_week === undefined || !start_time || !end_time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const approvalStatus = "pending"
    const approvedBy = null
    const approvedAt = null

    console.log("[v0] Creating show with approval_status:", approvalStatus)

    const result: any = await query(
      `INSERT INTO schedule (user_id, title, description, day_of_week, start_time, end_time, is_recurring, approval_status, approved_by, approved_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        authCheck.user.id,
        title,
        description,
        day_of_week,
        start_time,
        end_time,
        is_recurring ?? true,
        approvalStatus,
        approvedBy,
        approvedAt,
      ],
    )

    console.log("[v0] Show created with ID:", result.insertId, "Status: pending")

    const admins: any[] = await query(
      "SELECT email, first_name, username FROM users WHERE role IN ('admin', 'super_admin')",
    )

    for (const admin of admins) {
      await sendShowSubmissionEmail(admin.email, admin.first_name || admin.username, {
        title,
        presenterName: authCheck.user.username,
        dayOfWeek: day_of_week,
        startTime: start_time,
        endTime: end_time,
        description,
      })
    }

    console.log(`[v0] Sent show submission notifications to ${admins.length} admins`)

    return NextResponse.json({
      id: result.insertId,
      message: "Show submitted for approval",
      approvalStatus,
    })
  } catch (error) {
    console.error("[v0] Failed to create show:", error)
    return NextResponse.json({ error: "Failed to create show" }, { status: 500 })
  }
}
