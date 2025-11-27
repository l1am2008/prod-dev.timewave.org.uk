"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Save, Music, Search, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BioWithMentions } from "@/components/user-mention"

interface Profile {
  username: string
  email: string
  first_name: string
  last_name: string
  bio: string
  avatar_url: string
  favorite_song_title: string
  favorite_song_artist: string
  favorite_song_itunes_id: string
  favorite_song_artwork: string
}

interface Song {
  trackId: number
  trackName: string
  artistName: string
  artworkUrl100: string
  collectionName: string
}

export default function EditProfilePage() {
  const { toast } = useToast()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [searching, setSearching] = useState(false)
  const [songDialogOpen, setSongDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    avatar_url: "",
    favorite_song_title: "",
    favorite_song_artist: "",
    favorite_song_itunes_id: "",
    favorite_song_artwork: "",
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
          favorite_song_title: data.favorite_song_title || "",
          favorite_song_artist: data.favorite_song_artist || "",
          favorite_song_itunes_id: data.favorite_song_itunes_id || "",
          favorite_song_artwork: data.favorite_song_artwork || "",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const searchSongs = async () => {
    if (!searchTerm.trim()) return

    setSearching(true)
    try {
      const response = await fetch(`/api/itunes/search?term=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error("[v0] Search failed:", error)
      toast({
        title: "Error",
        description: "Failed to search songs",
        variant: "destructive",
      })
    } finally {
      setSearching(false)
    }
  }

  const selectSong = (song: Song) => {
    setFormData({
      ...formData,
      favorite_song_title: song.trackName,
      favorite_song_artist: song.artistName,
      favorite_song_itunes_id: song.trackId.toString(),
      favorite_song_artwork: song.artworkUrl100,
    })
    setSongDialogOpen(false)
    setSearchTerm("")
    setSearchResults([])
  }

  const removeSong = () => {
    setFormData({
      ...formData,
      favorite_song_title: "",
      favorite_song_artist: "",
      favorite_song_itunes_id: "",
      favorite_song_artwork: "",
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        })
        router.push(`/user/${profile?.username}`)
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="container py-8">Loading...</div>
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground">Update your public profile information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Enter a URL to your profile picture</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {formData.avatar_url ? (
              <img
                src={formData.avatar_url || "/placeholder.svg"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-lg">
                <span className="text-3xl font-bold">{profile?.username.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="flex-1">
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Tell others about yourself</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">About Me</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell others about yourself... (Use @username to mention users)"
              className="min-h-[120px]"
            />
            {formData.bio && (
              <div className="mt-2 p-3 rounded-lg border bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground mb-2">Preview:</p>
                <BioWithMentions bio={formData.bio} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Favorite Song</CardTitle>
          <CardDescription>Search and select your favorite song from iTunes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.favorite_song_title ? (
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
              <img
                src={formData.favorite_song_artwork || "/placeholder.svg"}
                alt={formData.favorite_song_title}
                className="w-16 h-16 rounded"
              />
              <div className="flex-1">
                <p className="font-semibold">{formData.favorite_song_title}</p>
                <p className="text-sm text-muted-foreground">{formData.favorite_song_artist}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={removeSong}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No favorite song selected</p>
          )}

          <Dialog open={songDialogOpen} onOpenChange={setSongDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full bg-transparent">
                <Music className="h-4 w-4 mr-2" />
                {formData.favorite_song_title ? "Change Song" : "Select Song"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Search for Your Favorite Song</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for a song..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchSongs()}
                  />
                  <Button onClick={searchSongs} disabled={searching}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {searching && <p className="text-sm text-muted-foreground text-center">Searching...</p>}

                <div className="space-y-2">
                  {searchResults.map((song) => (
                    <button
                      key={song.trackId}
                      onClick={() => selectSong(song)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      <img
                        src={song.artworkUrl100 || "/placeholder.svg"}
                        alt={song.trackName}
                        className="w-12 h-12 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{song.trackName}</p>
                        <p className="text-sm text-muted-foreground truncate">{song.artistName}</p>
                        <p className="text-xs text-muted-foreground truncate">{song.collectionName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        <Button variant="outline" onClick={() => router.push(`/user/${profile?.username}`)}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
