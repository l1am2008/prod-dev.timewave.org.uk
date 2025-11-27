import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/middleware"
import { sendShowApprovalEmail } from "@/lib/email"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const authCheck = await requireAdmin(request)

  if (!authCheck.valid || !authCheck.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const showId = params.id
    const body = await request.json()
    const { approved, rejection_reason } = body

    // Get show details with presenter info
    const shows: any[] = await query(
      `SELECT s.*, u.email, u.first_name, u.username 
       FROM schedule s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.id = ?`,
      [showId],
    )

    if (shows.length === 0) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 })
    }

    const show = shows[0]
    const approvalStatus = approved ? "approved" : "rejected"

    // Update show approval status
    await query(
      `UPDATE schedule 
       SET approval_status = ?, approved_by = ?, approved_at = ?, rejection_reason = ?
       WHERE id = ?`,
      [approvalStatus, authCheck.user.id, new Date(), rejection_reason || null, showId],
    )

    await sendShowApprovalEmail(show.email, show.first_name || show.username, {
      title: show.title,
      dayOfWeek: show.day_of_week,
      startTime: show.start_time,
      endTime: show.end_time,
      approved,
      rejectionReason: rejection_reason,
    })

    console.log(`[v0] Show ${approved ? "approved" : "rejected"} and email sent to presenter`)

    return NextResponse.json({
      message: `Show ${approved ? "approved" : "rejected"} successfully`,
    })
  } catch (error) {
    console.error("[v0] Failed to approve show:", error)
    return NextResponse.json({ error: "Failed to update show approval" }, { status: 500 })
  }
}
