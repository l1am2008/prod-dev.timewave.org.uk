import { query } from "./db"
import { fetchNowPlaying } from "./azuracast"

interface LiveStreamerInfo {
  user_id: number
  encoder_id: string
  username: string
}

export async function checkAndUpdateLiveStatus() {
  try {
    // Fetch current now playing data
    const nowPlaying = await fetchNowPlaying()

    // Check if someone is live
    const isLive = nowPlaying.live.is_live
    const streamerName = nowPlaying.live.streamer_name

    console.log("[v0] Live check:", { isLive, streamerName })

    if (isLive && streamerName) {
      // Find the user by streamer name (username)
      const users: any[] = await query(
        `SELECT u.id, se.encoder_id 
         FROM users u
         INNER JOIN staff_encoders se ON u.id = se.user_id
         WHERE u.username = ? AND u.role = 'staff'`,
        [streamerName],
      )

      if (users.length > 0) {
        const user = users[0]

        // Check if there's already an active session
        const activeSessions: any[] = await query("SELECT id FROM live_sessions WHERE user_id = ? AND is_live = TRUE", [
          user.id,
        ])

        if (activeSessions.length === 0) {
          // Create new live session
          await query(
            `INSERT INTO live_sessions (user_id, encoder_id, listeners_peak)
             VALUES (?, ?, ?)`,
            [user.id, user.encoder_id, nowPlaying.listeners.current],
          )

          console.log("[v0] Started new live session for user:", user.id)
        } else {
          // Update peak listeners if current is higher
          await query(
            `UPDATE live_sessions 
             SET listeners_peak = GREATEST(listeners_peak, ?)
             WHERE id = ?`,
            [nowPlaying.listeners.current, activeSessions[0].id],
          )
        }
      }
    } else {
      // No one is live - end all active sessions
      await query(
        `UPDATE live_sessions 
         SET is_live = FALSE, ended_at = NOW()
         WHERE is_live = TRUE AND ended_at IS NULL`,
      )
    }

    return { success: true, isLive, streamerName }
  } catch (error) {
    console.error("[v0] Live detection error:", error)
    return { success: false, error }
  }
}

export async function getCurrentLiveStreamer(): Promise<LiveStreamerInfo | null> {
  try {
    const nowPlaying = await fetchNowPlaying()

    if (!nowPlaying.live.is_live || !nowPlaying.live.streamer_name) {
      return null
    }

    const users: any[] = await query(
      `SELECT u.id as user_id, u.username, se.encoder_id
       FROM users u
       INNER JOIN staff_encoders se ON u.id = se.user_id
       WHERE u.username = ? AND u.role = 'staff'`,
      [nowPlaying.live.streamer_name],
    )

    if (users.length === 0) {
      return null
    }

    return users[0]
  } catch (error) {
    console.error("[v0] Failed to get current live streamer:", error)
    return null
  }
}
