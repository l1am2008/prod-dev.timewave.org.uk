import { NextResponse } from "next/server"
import { fetchNowPlaying } from "@/lib/azuracast"
import { searchITunes } from "@/lib/itunes"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const nowPlaying = await fetchNowPlaying()

    // Try to get better artwork from iTunes
    let enhancedArtwork = nowPlaying.now_playing.song.art

    if (nowPlaying.now_playing.song.artist && nowPlaying.now_playing.song.title) {
      const itunesData = await searchITunes(nowPlaying.now_playing.song.artist, nowPlaying.now_playing.song.title)

      if (itunesData && itunesData.artworkUrl600) {
        enhancedArtwork = itunesData.artworkUrl600
      }
    }

    return NextResponse.json({
      ...nowPlaying,
      now_playing: {
        ...nowPlaying.now_playing,
        song: {
          ...nowPlaying.now_playing.song,
          art: enhancedArtwork,
        },
      },
    })
  } catch (error) {
    console.error("[v0] Now playing error:", error)
    return NextResponse.json({ error: "Failed to fetch now playing data" }, { status: 500 })
  }
}
