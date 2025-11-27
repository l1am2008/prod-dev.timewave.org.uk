"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"

const STREAM_URL = "https://admin.stream.timewave.org.uk/listen/timewave_radio/radio.mp3"

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

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
    <div className="flex items-center gap-4">
      <audio ref={audioRef} src={STREAM_URL} preload="none" />

      <Button size="lg" onClick={togglePlay} className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700">
        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
      </Button>

      <div className="flex items-center gap-2 min-w-[120px]">
        <Button size="icon" variant="ghost" onClick={toggleMute} className="h-8 w-8">
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <Slider
          value={[isMuted ? 0 : volume]}
          onValueChange={(value) => setVolume(value[0])}
          max={100}
          step={1}
          className="w-20"
        />
      </div>
    </div>
  )
}
