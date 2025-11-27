"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, UserPlus, UserMinus, Edit, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  friend_count: number
  created_at: string
}

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFriend, setIsFriend] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [friends, setFriends] = useState<any[]>([])

  useEffect(() => {
    fetchProfile()
    checkIfOwnProfile()
    fetchFriends()
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
      console.error("[v0] Failed to check profile:", error)
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
      console.error("[v0] Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      const response = await fetch("/api/friends", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setFriends(data)
        setIsFriend(data.some((f: any) => f.username === params.username))
      }
    } catch (error) {
      console.error("[v0] Failed to fetch friends:", error)
    }
  }

  const toggleFriend = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast({
          title: "Error",
          description: "You must be logged in",
          variant: "destructive",
        })
        return
      }

      if (isFriend) {
        const response = await fetch(`/api/friends/${profile?.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          setIsFriend(false)
          toast({ title: "Success", description: "Friend removed" })
        }
      } else {
        const response = await fetch("/api/friends", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ friend_id: profile?.id }),
        })

        if (response.ok) {
          setIsFriend(true)
          toast({ title: "Success", description: "Friend added" })
        }
      }

      fetchProfile()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update friend status",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="container py-8">Loading...</div>
  }

  if (!profile) {
    return <div className="container py-8">User not found</div>
  }

  return (
    <div className="container max-w-4xl py-8 space-y-6">
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

              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Button onClick={() => router.push("/user/profile")}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button onClick={toggleFriend} variant={isFriend ? "outline" : "default"}>
                    {isFriend ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove Friend
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Friend
                      </>
                    )}
                  </Button>
                )}
              </div>

              <div className="flex gap-4 text-sm">
                <div>
                  <span className="font-bold">{profile.friend_count}</span>
                  <span className="text-muted-foreground ml-1">Friends</span>
                </div>
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
            <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
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

      {friends.length > 0 && isOwnProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Friends ({friends.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {friends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => router.push(`/user/${friend.username}`)}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  {friend.avatar_url ? (
                    <img
                      src={friend.avatar_url || "/placeholder.svg"}
                      alt={friend.username}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-bold">{friend.username.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="font-medium text-sm truncate w-full">{friend.username}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
