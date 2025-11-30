import { NextResponse } from "next/server"
import { fetchSongHistory } from "@/lib/azuracast"

// Get recent history from AzuraCast
export async function GET() {
  try {
    const history = await fetchSongHistory()
    const recentHistory = history.slice(0, 5)

    // Transform the data to match the expected format
    const formattedHistory = recentHistory.map((item) => ({
      song_title: item.song.title,
      song_artist: item.song.artist,
      song_album: item.song.album,
      album_art_url: item.song.art,
      played_at: new Date(item.played_at * 1000).toISOString(),
    }))

    return NextResponse.json(formattedHistory)
  } catch (error) {
    console.error("[Cymatic Group] Failed to fetch song history from AzuraCast:", error)
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
