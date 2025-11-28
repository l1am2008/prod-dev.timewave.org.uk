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

      <div className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-6">
            {/* Album art with live indicator */}
            <div className="relative flex-shrink-0">
              <img
                src={nowPlaying?.song.art || "/placeholder.svg?height=64&width=64"}
                alt="Now playing"
                className="w-16 h-16 rounded-lg"
              />
              {livePresenter && (
                <div className="absolute -top-1 -left-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                  LIVE
                </div>
              )}
            </div>

            {/* Now playing info with live presenter on the left */}
            <div className="flex-1 min-w-0 space-y-1">
              <p className="font-medium text-lg truncate">{nowPlaying?.song.title || "Timewave Radio"}</p>
              <p className="text-sm text-muted-foreground truncate">{nowPlaying?.song.artist || "Loading..."}</p>

              {/* Live presenter info inline with song metadata */}
              {livePresenter && (
                <Link href={`/user/${livePresenter.username}`}>
                  <div className="flex items-center gap-2 mt-1 text-sm hover:opacity-80 transition-opacity">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    {livePresenter.avatar_url ? (
                      <img
                        src={livePresenter.avatar_url || "/placeholder.svg"}
                        alt={livePresenter.username}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold">{livePresenter.username.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <span className="text-red-500 font-medium">
                      Live with{" "}
                      {livePresenter.first_name && livePresenter.last_name
                        ? `${livePresenter.first_name} ${livePresenter.last_name}`
                        : livePresenter.username}
                    </span>
                  </div>
                </Link>
              )}
            </div>

            {/* Player controls on the right */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <Button size="lg" onClick={togglePlay} className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>

              <div className="hidden md:flex items-center gap-2">
                <Button size="icon" variant="ghost" onClick={toggleMute} className="h-8 w-8">
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={(value) => setVolume(value[0])}
                  max={100}
                  step={1}
                  className="w-24"
                />
              </div>

              <div className="hidden sm:block text-sm text-muted-foreground whitespace-nowrap">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {nowPlaying?.listeners.current || 0} listeners
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from going under fixed player */}
      <div className="h-20"></div>
    </>
  )
}
