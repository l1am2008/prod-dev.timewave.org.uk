import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// Manual trigger endpoint for testing live detection
export async function GET() {
  try {
    const azuracastUrl = process.env.AZURACAST_API_URL?.replace("/api", "") || process.env.AZURACAST_BASE_URL
    const azuracastApiKey = process.env.AZURACAST_API_KEY

    if (!azuracastUrl) {
      return NextResponse.json({ error: "AZURACAST_API_URL not configured in environment variables" }, { status: 500 })
    }

    // Fetch station status from AzuraCast
    const response = await fetch(`${azuracastUrl}/api/nowplaying/timewave_radio`, {
      headers: azuracastApiKey ? { "X-API-Key": azuracastApiKey } : {},
    })
    const data = await response.json()

    // Check staff_encoders table
    const encoders: any[] = await query(
      `SELECT se.*, u.id as user_id, u.username, u.first_name, u.last_name, u.avatar_url
       FROM staff_encoders se
       INNER JOIN users u ON se.user_id = u.id
       WHERE se.is_active = TRUE`,
    )

    if (data.live && data.live.is_live) {
      const streamerName = data.live.streamer_name || ""

      // Try to match
      let matchedEncoder = null
      for (const encoder of encoders) {
        if (
          streamerName.toLowerCase().includes(encoder.username.toLowerCase()) ||
          encoder.encoder_id === streamerName
        ) {
          matchedEncoder = encoder
          break
        }
      }

      if (!matchedEncoder && encoders.length === 1) {
        matchedEncoder = encoders[0]
      }

      if (matchedEncoder) {
        // Check existing sessions
        const existingSessions: any[] = await query(
          `SELECT * FROM live_sessions WHERE user_id = ? AND is_live = TRUE`,
          [matchedEncoder.user_id],
        )

        if (existingSessions.length === 0) {
          // Create a new live session
          await query(
            `INSERT INTO live_sessions (user_id, encoder_id, is_live, started_at) VALUES (?, ?, TRUE, NOW())`,
            [matchedEncoder.user_id, matchedEncoder.encoder_id],
          )

          return NextResponse.json({
            success: true,
            action: "created_session",
            user: matchedEncoder.username,
            streamer: streamerName,
          })
        } else {
          return NextResponse.json({
            success: true,
            action: "session_exists",
            user: matchedEncoder.username,
          })
        }
      } else {
        return NextResponse.json({
          success: false,
          error: "No matching encoder found",
          streamer: streamerName,
          available_encoders: encoders.map((e) => ({ username: e.username, encoder_id: e.encoder_id })),
        })
      }
    } else {
      return NextResponse.json({
        success: true,
        action: "no_live_stream",
        live_data: data.live,
      })
    }
  } catch (error) {
    console.error("[Cymatic Group] Failed to detect live session:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
