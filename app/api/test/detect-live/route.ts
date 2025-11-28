import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// Manual trigger endpoint for testing live detection
export async function GET() {
  try {
    console.log("[v0] === MANUAL LIVE DETECTION TEST ===")

    const azuracastUrl = process.env.AZURACAST_API_URL?.replace("/api", "") || process.env.AZURACAST_BASE_URL
    const azuracastApiKey = process.env.AZURACAST_API_KEY

    console.log("[v0] AzuraCast URL:", azuracastUrl)

    if (!azuracastUrl) {
      return NextResponse.json({ error: "AZURACAST_API_URL not configured in environment variables" }, { status: 500 })
    }

    // Fetch station status from AzuraCast
    const response = await fetch(`${azuracastUrl}/api/nowplaying/timewave_radio`, {
      headers: azuracastApiKey ? { "X-API-Key": azuracastApiKey } : {},
    })
    const data = await response.json()

    console.log("[v0] AzuraCast nowplaying response:", JSON.stringify(data, null, 2))

    // Check staff_encoders table
    const encoders: any[] = await query(
      `SELECT se.*, u.id as user_id, u.username, u.first_name, u.last_name, u.avatar_url
       FROM staff_encoders se
       INNER JOIN users u ON se.user_id = u.id
       WHERE se.is_active = TRUE`,
    )

    console.log("[v0] Active encoders:", encoders)

    if (data.live && data.live.is_live) {
      const streamerName = data.live.streamer_name || ""
      console.log("[v0] Live streamer detected:", streamerName)

      // Try to match
      let matchedEncoder = null
      for (const encoder of encoders) {
        console.log(`[v0] Checking encoder: ${encoder.username} (${encoder.encoder_id})`)
        if (
          streamerName.toLowerCase().includes(encoder.username.toLowerCase()) ||
          encoder.encoder_id === streamerName
        ) {
          matchedEncoder = encoder
          console.log("[v0] MATCHED!")
          break
        }
      }

      if (!matchedEncoder && encoders.length === 1) {
        matchedEncoder = encoders[0]
        console.log("[v0] Using single active encoder as match")
      }

      if (matchedEncoder) {
        // Check existing sessions
        const existingSessions: any[] = await query(
          `SELECT * FROM live_sessions WHERE user_id = ? AND is_live = TRUE`,
          [matchedEncoder.user_id],
        )

        console.log("[v0] Existing live sessions:", existingSessions)

        if (existingSessions.length === 0) {
          // Create a new live session
          await query(
            `INSERT INTO live_sessions (user_id, encoder_id, is_live, started_at) VALUES (?, ?, TRUE, NOW())`,
            [matchedEncoder.user_id, matchedEncoder.encoder_id],
          )
          console.log(`[v0] ✅ Created live session for user ${matchedEncoder.username}`)

          return NextResponse.json({
            success: true,
            action: "created_session",
            user: matchedEncoder.username,
            streamer: streamerName,
          })
        } else {
          console.log(`[v0] ℹ️ Live session already exists for user ${matchedEncoder.username}`)
          return NextResponse.json({
            success: true,
            action: "session_exists",
            user: matchedEncoder.username,
          })
        }
      } else {
        console.log("[v0] ❌ No matching encoder found for streamer:", streamerName)
        return NextResponse.json({
          success: false,
          error: "No matching encoder found",
          streamer: streamerName,
          available_encoders: encoders.map((e) => ({ username: e.username, encoder_id: e.encoder_id })),
        })
      }
    } else {
      console.log("[v0] No one is currently live")
      return NextResponse.json({
        success: true,
        action: "no_live_stream",
        live_data: data.live,
      })
    }
  } catch (error) {
    console.error("[v0] Failed to detect live session:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
