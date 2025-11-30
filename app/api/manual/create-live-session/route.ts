import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { cookies } from "next/headers"

// Manual endpoint for staff to start a live session
export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized - no token" }, { status: 401 })
    }

    const user = verifyToken(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (!["staff", "admin", "super_admin"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden - staff access required" }, { status: 403 })
    }

    const encoders: any[] = await query(`SELECT * FROM staff_encoders WHERE user_id = ? AND is_active = TRUE`, [
      user.id,
    ])

    if (encoders.length === 0) {
      return NextResponse.json({ error: "No active encoder found for your account" }, { status: 400 })
    }

    const existingSessions: any[] = await query(`SELECT * FROM live_sessions WHERE user_id = ? AND is_live = TRUE`, [
      user.id,
    ])

    if (existingSessions.length > 0) {
      return NextResponse.json({
        message: "Live session already active",
        session_id: existingSessions[0].id,
      })
    }

    await query(`INSERT INTO live_sessions (user_id, encoder_id, is_live, started_at) VALUES (?, ?, TRUE, NOW())`, [
      user.id,
      encoders[0].encoder_id,
    ])

    return NextResponse.json({
      success: true,
      message: "Live session started",
      user: {
        username: user.username,
      },
    })
  } catch (error) {
    console.error("[Cymatic Group] Failed to create live session:", error)
    return NextResponse.json({ error: "Failed to create live session" }, { status: 500 })
  }
}

// Manual endpoint to end a live session
export async function DELETE() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    await query(`UPDATE live_sessions SET is_live = FALSE, ended_at = NOW() WHERE user_id = ? AND is_live = TRUE`, [
      user.id,
    ])

    return NextResponse.json({ success: true, message: "Live session ended" })
  } catch (error) {
    console.error("[Cymatic Group] Failed to end live session:", error)
    return NextResponse.json({ error: "Failed to end live session" }, { status: 500 })
  }
}
