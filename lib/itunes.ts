export interface ITunesTrack {
  artistName: string
  trackName: string
  collectionName: string
  artworkUrl100: string
  artworkUrl600?: string
}

export async function searchITunes(artist: string, track: string): Promise<ITunesTrack | null> {
  try {
    const query = encodeURIComponent(`${artist} ${track}`)
    const response = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=1`)

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (data.results && data.results.length > 0) {
      const result = data.results[0]
      return {
        artistName: result.artistName,
        trackName: result.trackName,
        collectionName: result.collectionName,
        artworkUrl100: result.artworkUrl100,
        artworkUrl600: result.artworkUrl600 || result.artworkUrl100.replace("100x100", "600x600"),
      }
    }

    return null
  } catch (error) {
    console.error("[v0] iTunes API error:", error)
    return null
  }
}
