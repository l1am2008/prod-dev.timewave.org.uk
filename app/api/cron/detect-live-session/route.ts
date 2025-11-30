import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// This endpoint checks AzuraCast for live sources and creates/updates live sessions
export async function GET() {
  try {
    const azuracastUrl = process.env.AZURACAST_API_URL?.replace("/api", "") || process.env.AZURACAST_BASE_URL
    const azuracastApiKey = process.env.AZURACAST_API_KEY

    if (!azuracastUrl) {
      console.error("[Cymatic Group] AZURACAST_API_URL not configured!")
      return NextResponse.json({ error: "AzuraCast URL not configured" }, { status: 500 })
    }

    const response = await fetch(`${azuracastUrl}/api/nowplaying/timewave_radio`, {
      headers: azuracastApiKey ? { "X-API-Key": azuracastApiKey } : {},
    })
    const data = await response.json()

    if (data.live && data.live.is_live) {
      const streamerName = data.live.streamer_name || ""

      const encoders: any[] = await query(
        `SELECT se.*, u.id as user_id, u.username, u.first_name, u.last_name, u.avatar_url
         FROM staff_encoders se
         INNER JOIN users u ON se.user_id = u.id
         WHERE se.is_active = TRUE`,
      )

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
        const existingSessions: any[] = await query(
          `SELECT * FROM live_sessions WHERE user_id = ? AND is_live = TRUE`,
          [matchedEncoder.user_id],
        )

        if (existingSessions.length === 0) {
          await query(
            `INSERT INTO live_sessions (user_id, encoder_id, is_live, started_at) VALUES (?, ?, TRUE, NOW())`,
            [matchedEncoder.user_id, matchedEncoder.encoder_id],
          )
        }
      }
    } else {
      await query(
        `UPDATE live_sessions SET is_live = FALSE, ended_at = NOW() WHERE is_live = TRUE AND ended_at IS NULL`,
      )
    }

    return NextResponse.json({ success: true, checked_at: new Date().toISOString() })
  } catch (error) {
    console.error("[Cymatic Group] Failed to detect live session:", error)
    return NextResponse.json({ error: "Failed to detect live session" }, { status: 500 })
  }
}
