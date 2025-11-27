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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Check if user is staff
    if (!["staff", "admin", "super_admin"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden - staff access required" }, { status: 403 })
    }

    console.log(`[v0] Creating live session for user ${user.username}`)

    // Check if user has an encoder
    const encoders: any[] = await query(`SELECT * FROM staff_encoders WHERE user_id = ? AND is_active = TRUE`, [
      user.id,
    ])

    if (encoders.length === 0) {
      return NextResponse.json({ error: "No active encoder found for your account" }, { status: 400 })
    }

    // Check if there's already an active session
    const existingSessions: any[] = await query(`SELECT * FROM live_sessions WHERE user_id = ? AND is_live = TRUE`, [
      user.id,
    ])

    if (existingSessions.length > 0) {
      return NextResponse.json({
        message: "Live session already active",
        session_id: existingSessions[0].id,
      })
    }

    // Create a new live session
    await query(`INSERT INTO live_sessions (user_id, encoder_id, is_live, started_at) VALUES (?, ?, TRUE, NOW())`, [
      user.id,
      encoders[0].encoder_id,
    ])

    console.log(`[v0] Successfully created live session for ${user.username}`)

    return NextResponse.json({
      success: true,
      message: "Live session started",
      user: {
        username: user.username,
        name: `${user.firstName} ${user.lastName}`,
      },
    })
  } catch (error) {
    console.error("[v0] Failed to create live session:", error)
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

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    console.log(`[v0] Ending live session for user ${user.username}`)

    // End all active sessions for this user
    await query(`UPDATE live_sessions SET is_live = FALSE, ended_at = NOW() WHERE user_id = ? AND is_live = TRUE`, [
      user.id,
    ])

    console.log(`[v0] Successfully ended live session for ${user.username}`)

    return NextResponse.json({ success: true, message: "Live session ended" })
  } catch (error) {
    console.error("[v0] Failed to end live session:", error)
    return NextResponse.json({ error: "Failed to end live session" }, { status: 500 })
  }
}
