"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AudioPlayer } from "./audio-player"

interface NowPlayingData {
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
  }
  listeners: {
    current: number
  }
}

export function NowPlayingBanner() {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const response = await fetch("/api/now-playing")
        const data = await response.json()
        setNowPlaying(data)
      } catch (error) {
        console.error("[v0] Failed to fetch now playing:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNowPlaying()
    const interval = setInterval(fetchNowPlaying, 15000) // Update every 15 seconds

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="relative w-full bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-2xl overflow-hidden p-8 min-h-[320px] animate-pulse">
        <div className="flex items-center gap-6">
          <div className="w-48 h-48 bg-gray-700 rounded-lg" />
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-gray-700 rounded w-3/4" />
            <div className="h-6 bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      </div>
    )
  }

  if (!nowPlaying) {
    return null
  }

  const { song } = nowPlaying.now_playing
  const isLive = nowPlaying.live.is_live

  return (
    <div className="relative w-full bg-gradient-to-br from-blue-900 via-purple-900 to-black rounded-2xl overflow-hidden">
      {/* Background blur effect */}
      <div
        className="absolute inset-0 opacity-30 blur-3xl"
        style={{
          backgroundImage: `url(${song.art})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative p-8 flex flex-col md:flex-row items-center gap-6">
        {/* Album artwork */}
        <div className="relative w-48 h-48 flex-shrink-0">
          <Image
            src={song.art || "/placeholder.svg?height=192&width=192"}
            alt={`${song.title} artwork`}
            width={192}
            height={192}
            className="rounded-lg shadow-2xl"
            priority
          />
          {isLive && (
            <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
          )}
        </div>

        {/* Song info and controls */}
        <div className="flex-1 text-white space-y-4">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-balance">{song.title}</h2>
            <p className="text-xl text-gray-300">{song.artist}</p>
            {song.album && <p className="text-sm text-gray-400 mt-1">{song.album}</p>}
            {isLive && nowPlaying.live.streamer_name && (
              <p className="text-sm text-blue-300 mt-2">
                {"Live with "} {nowPlaying.live.streamer_name}
              </p>
            )}
          </div>

          <div className="flex items-center gap-6">
            <AudioPlayer />
            <div className="text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                {nowPlaying.listeners.current} {nowPlaying.listeners.current === 1 ? "listener" : "listeners"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
