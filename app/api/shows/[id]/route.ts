import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/middleware"

// PUT - Update a show
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authCheck = await verifyToken(request)

  if (!authCheck.valid || !authCheck.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const showId = params.id
    const body = await request.json()
    const { title, description, day_of_week, start_time, end_time, is_recurring, is_active } = body

    // Check if user owns this show or is admin
    const shows: any[] = await query("SELECT user_id FROM schedule WHERE id = ?", [showId])

    if (shows.length === 0) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 })
    }

    const isOwner = shows[0].user_id === authCheck.user.id
    const isAdmin = ["admin", "super_admin"].includes(authCheck.user.role)

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    let approvalStatus = "pending"
    let approvedBy = null
    let approvedAt = null

    if (isAdmin) {
      approvalStatus = "approved"
      approvedBy = authCheck.user.id
      approvedAt = new Date()
    }

    await query(
      `UPDATE schedule 
       SET title = ?, description = ?, day_of_week = ?, start_time = ?, end_time = ?, 
           is_recurring = ?, is_active = ?, approval_status = ?, approved_by = ?, approved_at = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title,
        description,
        day_of_week,
        start_time,
        end_time,
        is_recurring,
        is_active,
        approvalStatus,
        approvedBy,
        approvedAt,
        showId,
      ],
    )

    return NextResponse.json({ message: "Show updated successfully" })
  } catch (error) {
    console.error("[v0] Failed to update show:", error)
    return NextResponse.json({ error: "Failed to update show" }, { status: 500 })
  }
}

// DELETE - Delete a show
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authCheck = await verifyToken(request)

  if (!authCheck.valid || !authCheck.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const showId = params.id

    // Check if user owns this show or is admin
    const shows: any[] = await query("SELECT user_id FROM schedule WHERE id = ?", [showId])

    if (shows.length === 0) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 })
    }

    const isOwner = shows[0].user_id === authCheck.user.id
    const isAdmin = ["admin", "super_admin"].includes(authCheck.user.role)

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await query("DELETE FROM schedule WHERE id = ?", [showId])

    return NextResponse.json({ message: "Show deleted successfully" })
  } catch (error) {
    console.error("[v0] Failed to delete show:", error)
    return NextResponse.json({ error: "Failed to delete show" }, { status: 500 })
  }
}
