"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, X, Maximize2 } from "lucide-react"
import { cn } from "@/lib/utils"
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
  const [isMinimized, setIsMinimized] = useState(true)
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null)
  const [livePresenter, setLivePresenter] = useState<LivePresenter | null>(null)
  const [showMinimizedPlayer, setShowMinimizedPlayer] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const fullPlayerRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (!fullPlayerRef.current || isMinimized) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowMinimizedPlayer(!entry.isIntersecting)
      },
      {
        threshold: 0.1,
      },
    )

    observer.observe(fullPlayerRef.current)

    return () => {
      if (fullPlayerRef.current) {
        observer.unobserve(fullPlayerRef.current)
      }
    }
  }, [isMinimized])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
        setIsMinimized(true)
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

  if (!isPlaying && !isMinimized) return null

  return (
    <>
      <audio ref={audioRef} src={STREAM_URL} preload="none" />

      {showMinimizedPlayer && !isMinimized && isPlaying && (
        <div className="fixed bottom-4 right-4 w-80 z-50">
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={nowPlaying?.song.art || "/placeholder.svg?height=48&width=48"}
                  alt="Now playing"
                  className="w-12 h-12 rounded-lg"
                />
                {livePresenter && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{nowPlaying?.song.title || "Timewave Radio"}</p>
                <p className="text-xs text-muted-foreground truncate">{nowPlaying?.song.artist || "Loading..."}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={togglePlay} className="h-8 w-8">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {livePresenter && (
              <Link href={`/user/${livePresenter.username}`}>
                <div className="flex items-center gap-2 px-2 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer">
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
                  <div className="text-xs flex-1 min-w-0">
                    <p className="font-medium leading-none truncate">
                      {livePresenter.first_name && livePresenter.last_name
                        ? `${livePresenter.first_name} ${livePresenter.last_name}`
                        : livePresenter.username}
                    </p>
                    <p className="text-muted-foreground">Live Now</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      <div
        ref={fullPlayerRef}
        className={cn(
          "fixed z-50 transition-all duration-300",
          isMinimized ? "bottom-4 left-4 w-80" : "bottom-0 left-0 right-0 border-t border-border bg-card shadow-lg",
        )}
      >
        {isMinimized ? (
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={nowPlaying?.song.art || "/placeholder.svg?height=48&width=48"}
                  alt="Now playing"
                  className="w-12 h-12 rounded-lg"
                />
                {livePresenter && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{nowPlaying?.song.title || "Timewave Radio"}</p>
                <p className="text-xs text-muted-foreground truncate">{nowPlaying?.song.artist || "Loading..."}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={togglePlay} className="h-8 w-8">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setIsMinimized(false)} className="h-8 w-8">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {livePresenter && (
              <Link href={`/user/${livePresenter.username}`}>
                <div className="flex items-center gap-2 px-2 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer">
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
                  <div className="text-xs flex-1 min-w-0">
                    <p className="font-medium leading-none truncate">
                      {livePresenter.first_name && livePresenter.last_name
                        ? `${livePresenter.first_name} ${livePresenter.last_name}`
                        : livePresenter.username}
                    </p>
                    <p className="text-muted-foreground">Live Now</p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        ) : (
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={nowPlaying?.song.art || "/placeholder.svg?height=56&width=56"}
                  alt="Now playing"
                  className="w-14 h-14 rounded-lg"
                />
                {livePresenter && (
                  <div className="absolute -top-1 -left-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{nowPlaying?.song.title || "Timewave Radio"}</p>
                <p className="text-sm text-muted-foreground truncate">{nowPlaying?.song.artist || "Loading..."}</p>
                {livePresenter && (
                  <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                    Live with{" "}
                    <Link href={`/user/${livePresenter.username}`} className="hover:underline font-medium">
                      {livePresenter.first_name && livePresenter.last_name
                        ? `${livePresenter.first_name} ${livePresenter.last_name}`
                        : livePresenter.username}
                    </Link>
                  </p>
                )}
              </div>

              {livePresenter && (
                <Link href={`/user/${livePresenter.username}`} className="hidden md:block">
                  <div className="flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer">
                    {livePresenter.avatar_url ? (
                      <img
                        src={livePresenter.avatar_url || "/placeholder.svg"}
                        alt={livePresenter.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold">{livePresenter.username.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                    <div className="text-sm">
                      <p className="font-medium leading-none">
                        {livePresenter.first_name && livePresenter.last_name
                          ? `${livePresenter.first_name} ${livePresenter.last_name}`
                          : livePresenter.username}
                      </p>
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                        Live Now
                      </p>
                    </div>
                  </div>
                </Link>
              )}

              <div className="flex items-center gap-4">
                <Button size="lg" onClick={togglePlay} className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700">
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </Button>

                <div className="flex items-center gap-2">
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

                <div className="text-sm text-muted-foreground">{nowPlaying?.listeners.current || 0} listeners</div>

                <Button size="icon" variant="ghost" onClick={() => setIsMinimized(true)} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
