"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function RequestForm() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    song_title: "",
    artist_name: "",
    requester_name: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("auth_token")
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      }

      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch("/api/requests", {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Request submitted!",
          description: "Your song request has been sent to the DJ.",
        })
        setFormData({
          song_title: "",
          artist_name: "",
          requester_name: "",
          message: "",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to submit request. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Request a Song
        </CardTitle>
        <CardDescription>
          Send a song request to our DJs. They'll try to play it during the next available slot!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="song_title">Song Title *</Label>
              <Input
                id="song_title"
                required
                value={formData.song_title}
                onChange={(e) => setFormData({ ...formData, song_title: e.target.value })}
                placeholder="Enter song title"
              />
            </div>
            <div>
              <Label htmlFor="artist_name">Artist *</Label>
              <Input
                id="artist_name"
                required
                value={formData.artist_name}
                onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                placeholder="Enter artist name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="requester_name">Your Name (optional)</Label>
            <Input
              id="requester_name"
              value={formData.requester_name}
              onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
              placeholder="How should we call you?"
            />
          </div>

          <div>
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Add a shoutout or dedication..."
              className="min-h-[80px]"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
