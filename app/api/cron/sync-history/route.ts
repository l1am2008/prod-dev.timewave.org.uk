import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// Cron job to sync AzuraCast history to database
export async function POST(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch history from AzuraCast
    const response = await fetch("https://admin.stream.timewave.org.uk/api/station/timewave_radio/history")

    if (!response.ok) {
      throw new Error("Failed to fetch history from AzuraCast")
    }

    const history: any[] = await response.json()

    // Store last 5 songs if not already in database
    for (const track of history.slice(0, 5)) {
      const existing: any[] = await query(`SELECT id FROM song_history WHERE played_at = ?`, [
        new Date(track.played_at * 1000),
      ])

      if (existing.length === 0) {
        await query(
          `INSERT INTO song_history (song_title, song_artist, song_album, album_art_url, played_at, duration)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            track.song.title,
            track.song.artist,
            track.song.album || null,
            track.song.art,
            new Date(track.played_at * 1000),
            track.duration || null,
          ],
        )
        console.log("[v0] Synced song to history:", track.song.title)
      }
    }

    return NextResponse.json({ success: true, synced: history.length })
  } catch (error) {
    console.error("[v0] History sync error:", error)
    return NextResponse.json({ error: "Failed to sync history" }, { status: 500 })
  }
}
