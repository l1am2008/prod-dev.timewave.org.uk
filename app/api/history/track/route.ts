import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// Store song in history when it plays
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, artist, album, art, played_at, duration } = body

    await query(
      `INSERT INTO song_history (song_title, song_artist, song_album, album_art_url, played_at, duration)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, artist, album || null, art, new Date(played_at * 1000), duration || null],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Failed to track song history:", error)
    return NextResponse.json({ error: "Failed to track history" }, { status: 500 })
  }
}

// Get recent history
export async function GET() {
  try {
    const history: any[] = await query(
      `SELECT * FROM song_history 
       ORDER BY played_at DESC 
       LIMIT 5`,
    )

    return NextResponse.json(history)
  } catch (error) {
    console.error("[v0] Failed to fetch song history:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
