const AZURACAST_BASE_URL = "https://admin.stream.timewave.org.uk/api"
const AZURACAST_API_KEY = process.env.AZURACAST_API_KEY

export interface NowPlayingData {
  now_playing: {
    song: {
      title: string
      artist: string
      album: string
      art: string
    }
    elapsed: number
    duration: number
    is_live: boolean
  }
  live: {
    is_live: boolean
    streamer_name: string
    broadcast_start: number | null
  }
  listeners: {
    current: number
    unique: number
  }
}

export interface SongHistory {
  played_at: number
  song: {
    title: string
    artist: string
    album: string
    art: string
  }
}

export async function fetchNowPlaying(): Promise<NowPlayingData> {
  const response = await fetch(`${AZURACAST_BASE_URL}/nowplaying/timewave_radio`, {
    next: { revalidate: 10 }, // Cache for 10 seconds
  })

  if (!response.ok) {
    throw new Error("Failed to fetch now playing data")
  }

  return response.json()
}

export async function fetchSongHistory(): Promise<SongHistory[]> {
  const response = await fetch(`${AZURACAST_BASE_URL}/station/timewave_radio/history`, {
    headers: {
      "X-API-Key": AZURACAST_API_KEY || "",
    },
    next: { revalidate: 30 },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch song history: ${response.status} ${errorText}`)
  }

  const data = await response.json()

  return data
}

export async function createEncoder(username: string, password: string): Promise<{ encoder_id: string }> {
  const response = await fetch(`${AZURACAST_BASE_URL}/station/1/streamers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": AZURACAST_API_KEY || "",
    },
    body: JSON.stringify({
      streamer_username: username,
      streamer_password: password,
      display_name: username,
      is_active: true,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to create encoder")
  }

  const data = await response.json()
  return { encoder_id: data.id }
}

export async function deleteEncoder(encoderId: string): Promise<void> {
  const response = await fetch(`${AZURACAST_BASE_URL}/station/1/streamer/${encoderId}`, {
    method: "DELETE",
    headers: {
      "X-API-Key": AZURACAST_API_KEY || "",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to delete encoder")
  }
}
