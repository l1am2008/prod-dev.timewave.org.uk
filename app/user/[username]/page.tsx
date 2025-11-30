"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, Edit, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BioWithMentions } from "@/components/user-mention"

interface UserProfile {
  id: number
  username: string
  first_name: string
  last_name: string
  avatar_url: string
  bio: string
  favorite_song_title: string
  favorite_song_artist: string
  favorite_song_artwork: string
  role: string
  staff_role: string
  created_at: string
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    fetchProfile()
    checkIfOwnProfile()
  }, [params.username])

  const checkIfOwnProfile = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const response = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setIsOwnProfile(data.username === params.username)
      }
    } catch (error) {
      console.error("Failed to check profile:", error)
    }
  }

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/user/profile/${params.username}`)

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else {
        toast({
          title: "Error",
          description: "User not found",
          variant: "destructive",
        })
        router.push("/")
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="py-8">Loading...</div>
  }

  if (!profile) {
    return <div className="py-8">User not found</div>
  }

  return (
    <div className="py-8 space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url || "/placeholder.svg"}
                alt={profile.username}
                className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-lg">
                <span className="text-5xl font-bold">{profile.username.charAt(0).toUpperCase()}</span>
              </div>
            )}

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">
                  {profile.first_name} {profile.last_name}
                </h1>
                <p className="text-muted-foreground">@{profile.username}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{profile.role}</Badge>
                  {profile.staff_role && <Badge variant="outline">{profile.staff_role}</Badge>}
                </div>
              </div>

              {isOwnProfile && (
                <Button onClick={() => router.push("/user/profile")}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}

              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(profile.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <BioWithMentions bio={profile.bio} />
          </CardContent>
        </Card>
      )}

      {profile.favorite_song_title && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Favorite Song
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <img
                src={profile.favorite_song_artwork || "/placeholder.svg"}
                alt={profile.favorite_song_title}
                className="w-20 h-20 rounded-lg shadow-md"
              />
              <div>
                <p className="font-semibold text-lg">{profile.favorite_song_title}</p>
                <p className="text-muted-foreground">{profile.favorite_song_artist}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
