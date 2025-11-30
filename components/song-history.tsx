"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

interface HistoryItem {
  id: number
  song_title: string
  song_artist: string
  album_art_url: string
  played_at: string
}

export function SongHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
    const interval = setInterval(fetchHistory, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/history/track")
      if (response.ok) {
        const data = await response.json()
        setHistory(data)
      }
    } catch (error) {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recently Played
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recently Played
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No song history yet</p>
          ) : (
            history.map((track) => (
              <div key={track.id} className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition-colors">
                <img
                  src={track.album_art_url || "/placeholder.svg?height=48&width=48"}
                  alt={track.song_title}
                  className="w-12 h-12 rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{track.song_title}</p>
                  <p className="text-sm text-muted-foreground truncate">{track.song_artist}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(track.played_at).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
