import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireStaff } from "@/lib/middleware"

// Update request status (staff only)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireStaff(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!["pending", "approved", "rejected", "played"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    await query(`UPDATE song_requests SET status = ?, updated_at = NOW() WHERE id = ?`, [status, id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Failed to update request:", error)
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
  }
}

// Delete request (staff only)
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireStaff(request)
    if (!authResult.valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await query(`DELETE FROM song_requests WHERE id = ?`, [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Failed to delete request:", error)
    return NextResponse.json({ error: "Failed to delete request" }, { status: 500 })
  }
}
