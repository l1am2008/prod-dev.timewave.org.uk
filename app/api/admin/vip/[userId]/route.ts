import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/middleware"

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const authCheck = await requireAdmin(request)
  if (!authCheck.valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { userId } = await params

  try {
    await query(
      `UPDATE users 
       SET is_vip = TRUE, 
           vip_granted_at = NOW(), 
           vip_granted_by = ?
       WHERE id = ?`,
      [authCheck.user!.userId, userId],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Failed to grant VIP:", error)
    return NextResponse.json({ error: "Failed to grant VIP status" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const authCheck = await requireAdmin(request)
  if (!authCheck.valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { userId } = await params

  try {
    await query(
      `UPDATE users 
       SET is_vip = FALSE, 
           vip_granted_at = NULL, 
           vip_granted_by = NULL
       WHERE id = ?`,
      [userId],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Failed to revoke VIP:", error)
    return NextResponse.json({ error: "Failed to revoke VIP status" }, { status: 500 })
  }
}
