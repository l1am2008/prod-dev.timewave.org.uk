import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// This endpoint checks AzuraCast for live sources and creates/updates live sessions
export async function GET() {
  try {
    console.log("[v0] Detecting live sessions from AzuraCast...")

    // Fetch station status from AzuraCast
    const azuracastUrl = process.env.AZURACAST_BASE_URL
    const response = await fetch(`${azuracastUrl}/api/nowplaying/timewave_radio`)
    const data = await response.json()

    console.log("[v0] AzuraCast live status:", data.live)

    if (data.live && data.live.is_live) {
      // Someone is live - check if it's a registered encoder
      const streamerName = data.live.streamer_name || ""
      console.log("[v0] Live streamer detected:", streamerName)

      // Try to find the encoder in our database
      const encoders: any[] = await query(
        `SELECT se.*, u.id as user_id, u.username, u.first_name, u.last_name
         FROM staff_encoders se
         INNER JOIN users u ON se.user_id = u.id
         WHERE se.is_active = TRUE`,
      )

      console.log("[v0] Active encoders in database:", encoders.length)

      // For now, match by checking if any encoder belongs to a user
      // In production, you'd match encoder_id from AzuraCast
      for (const encoder of encoders) {
        // Check if there's already an active session for this user
        const existingSessions: any[] = await query(
          `SELECT * FROM live_sessions WHERE user_id = ? AND is_live = TRUE`,
          [encoder.user_id],
        )

        if (existingSessions.length === 0) {
          // Create a new live session
          await query(
            `INSERT INTO live_sessions (user_id, encoder_id, is_live, started_at) VALUES (?, ?, TRUE, NOW())`,
            [encoder.user_id, encoder.encoder_id],
          )
          console.log(`[v0] Created live session for user ${encoder.username}`)
        } else {
          console.log(`[v0] Live session already exists for user ${encoder.username}`)
        }
      }
    } else {
      // No one is live - end all active sessions
      console.log("[v0] No live streams detected, ending active sessions...")
      await query(
        `UPDATE live_sessions SET is_live = FALSE, ended_at = NOW() WHERE is_live = TRUE AND ended_at IS NULL`,
      )
    }

    return NextResponse.json({ success: true, checked_at: new Date().toISOString() })
  } catch (error) {
    console.error("[v0] Failed to detect live session:", error)
    return NextResponse.json({ error: "Failed to detect live session" }, { status: 500 })
  }
}
