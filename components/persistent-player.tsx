"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, X, Maximize2 } from "lucide-react"
import { cn } from "@/lib/utils"

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

export function PersistentPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [isMinimized, setIsMinimized] = useState(true)
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null)
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
        console.error("[v0] Failed to fetch now playing:", error)
      }
    }

    fetchNowPlaying()
    const interval = setInterval(fetchNowPlaying, 15000)
    return () => clearInterval(interval)
  }, [])

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

      <div
        className={cn(
          "fixed z-50 transition-all duration-300",
          isMinimized ? "bottom-4 left-4 w-80" : "bottom-0 left-0 right-0 border-t border-border bg-card shadow-lg",
        )}
      >
        {isMinimized ? (
          // Minimized island view
          <div className="bg-card border border-border rounded-2xl shadow-2xl p-4">
            <div className="flex items-center gap-3">
              <img
                src={nowPlaying?.song.art || "/placeholder.svg?height=48&width=48"}
                alt="Now playing"
                className="w-12 h-12 rounded-lg"
              />
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
          </div>
        ) : (
          // Full player view at bottom
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <img
                src={nowPlaying?.song.art || "/placeholder.svg?height=56&width=56"}
                alt="Now playing"
                className="w-14 h-14 rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{nowPlaying?.song.title || "Timewave Radio"}</p>
                <p className="text-sm text-muted-foreground truncate">{nowPlaying?.song.artist || "Loading..."}</p>
              </div>

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
