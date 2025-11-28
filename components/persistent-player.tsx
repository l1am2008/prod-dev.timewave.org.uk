"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"
import Link from "next/link"

const STREAM_URL = "https://admin.stream.timewave.org.uk/listen/timewave_radio/radio.mp3"

interface NowPlayingData {
  song: {
    title: string
    artist: string
    art: string
  }
  listeners: {
    current: number
  }
}

interface LivePresenter {
  id: number
  username: string
  first_name: string
  last_name: string
  avatar_url: string
  staff_role: string
}

export function PersistentPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null)
  const [livePresenter, setLivePresenter] = useState<LivePresenter | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const response = await fetch("/api/now-playing")
        const data = await response.json()
        setNowPlaying({
          song: data.now_playing.song,
          listeners: data.listeners,
        })
      } catch (error) {
        console.error("Failed to fetch now playing:", error)
      }
    }

    const fetchLivePresenter = async () => {
      try {
        const response = await fetch("/api/live-presenter")
        const data = await response.json()
        if (data.is_live) {
          setLivePresenter(data.presenter)
        } else {
          setLivePresenter(null)
        }
      } catch (error) {
        console.error("Failed to fetch live presenter:", error)
      }
    }

    fetchNowPlaying()
    fetchLivePresenter()
    const nowPlayingInterval = setInterval(fetchNowPlaying, 15000)
    const presenterInterval = setInterval(fetchLivePresenter, 30000)

    return () => {
      clearInterval(nowPlayingInterval)
      clearInterval(presenterInterval)
    }
  }, [])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <>
      <audio ref={audioRef} src={STREAM_URL} preload="none" />

      {/* Hero player section - similar to Upbeat */}
      <div
        className="border-b"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url(${nowPlaying?.song.art || "/placeholder.svg"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-6 py-8">
          {/* Large song/presenter display */}
          <div className="flex items-center gap-6">
            {/* Left side - Song title and presenter info */}
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                {nowPlaying?.song.title || "Timewave Radio"}
              </h1>
              <p className="text-xl text-white/80 mb-3">{nowPlaying?.song.artist || "Loading..."}</p>

              {/* Live presenter prominently displayed */}
              {livePresenter && (
                <Link
                  href={`/user/${livePresenter.username}`}
                  className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={livePresenter.avatar_url || "/placeholder.svg"}
                    alt={livePresenter.username}
                    className="w-12 h-12 rounded-full object-cover border-2 border-red-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-500 font-semibold text-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        LIVE
                      </span>
                    </div>
                    <span className="text-white font-medium">
                      {livePresenter.first_name && livePresenter.last_name
                        ? `${livePresenter.first_name} ${livePresenter.last_name}`
                        : livePresenter.username}
                    </span>
                  </div>
                </Link>
              )}
            </div>

            {/* Right side - Album art */}
            <div className="hidden md:block relative flex-shrink-0">
              <img
                src={nowPlaying?.song.art || "/placeholder.svg?height=200&width=200"}
                alt="Album art"
                className="w-40 h-40 rounded-lg shadow-2xl object-cover"
              />
              {livePresenter && (
                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-lg">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  LIVE
                </div>
              )}
            </div>
          </div>

          {/* Horizontal control bar below - matching Upbeat style */}
          <div className="flex items-center gap-6 mt-6">
            <Button
              size="lg"
              onClick={togglePlay}
              className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
            </Button>

            <div className="flex items-center gap-3 flex-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleMute}
                className="h-10 w-10 text-white hover:bg-white/10"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={(value) => setVolume(value[0])}
                max={100}
                step={1}
                className="w-32 [&_[role=slider]]:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-white/90">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
              <span>{nowPlaying?.listeners.current || 0} listeners</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
