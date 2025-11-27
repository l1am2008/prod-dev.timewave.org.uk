"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Radio, TrendingUp, Activity, Calendar, PlayCircle, StopCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface StaffProfile {
  username: string
  staff_role: string
  encoder_id: string
  encoder_active: boolean
}

interface CurrentSession {
  is_live: boolean
  session?: {
    started_at: string
    listeners_peak: number
  }
}

export default function StaffDashboard() {
  const [profile, setProfile] = useState<StaffProfile | null>(null)
  const [currentSession, setCurrentSession] = useState<CurrentSession>({ is_live: false })
  const [loading, setLoading] = useState(true)
  const [isTogglingLive, setIsTogglingLive] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchCurrentSession, 15000) // Check every 15 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    await Promise.all([fetchProfile(), fetchCurrentSession()])
    setLoading(false)
  }

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/staff/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch profile:", error)
    }
  }

  const fetchCurrentSession = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/staff/current-session", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentSession(data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch current session:", error)
    }
  }

  const handleGoLive = async () => {
    setIsTogglingLive(true)
    try {
      const response = await fetch("/api/manual/create-live-session", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "You're now live!",
          description: "Your profile is now showing on the main player.",
        })
        await fetchCurrentSession()
      } else {
        toast({
          title: "Failed to go live",
          description: data.error || "Please try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to start live session:", error)
      toast({
        title: "Error",
        description: "Failed to start live session",
        variant: "destructive",
      })
    } finally {
      setIsTogglingLive(false)
    }
  }

  const handleGoOffline = async () => {
    setIsTogglingLive(true)
    try {
      const response = await fetch("/api/manual/create-live-session", {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Session ended",
          description: "You are now offline.",
        })
        await fetchCurrentSession()
      } else {
        toast({
          title: "Failed to end session",
          description: data.error || "Please try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to end live session:", error)
      toast({
        title: "Error",
        description: "Failed to end session",
        variant: "destructive",
      })
    } finally {
      setIsTogglingLive(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome back, {profile?.username}!</h2>
        <p className="text-muted-foreground">
          {profile?.staff_role ? `${profile.staff_role} at Timewave Radio` : "Staff Member"}
        </p>
      </div>

      <Card className={currentSession.is_live ? "border-red-500 bg-red-500/5" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentSession.is_live && (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
            {currentSession.is_live ? "You are currently LIVE!" : "Broadcast Controls"}
          </CardTitle>
          <CardDescription>
            {currentSession.is_live
              ? `Broadcasting since ${new Date(currentSession.session?.started_at || "").toLocaleTimeString()}`
              : "Start broadcasting to show your profile on the main player"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentSession.is_live && (
            <div className="text-2xl font-bold mb-4">Peak listeners: {currentSession.session?.listeners_peak || 0}</div>
          )}
          <div className="flex gap-2">
            {!currentSession.is_live ? (
              <Button
                onClick={handleGoLive}
                disabled={isTogglingLive || !profile?.encoder_active}
                className="bg-red-600 hover:bg-red-700"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                {isTogglingLive ? "Starting..." : "Go Live"}
              </Button>
            ) : (
              <Button onClick={handleGoOffline} disabled={isTogglingLive} variant="destructive">
                <StopCircle className="h-4 w-4 mr-2" />
                {isTogglingLive ? "Ending..." : "End Broadcast"}
              </Button>
            )}
          </div>
          {!profile?.encoder_active && !currentSession.is_live && (
            <p className="text-sm text-muted-foreground">
              Your encoder must be active before you can go live. Contact an administrator for assistance.
            </p>
          )}
        </CardContent>
      </Card>

      {currentSession.is_live && (
        <Card className="border-red-500 bg-red-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              You are currently LIVE!
            </CardTitle>
            <CardDescription>
              Broadcasting since {new Date(currentSession.session?.started_at || "").toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Peak listeners: {currentSession.session?.listeners_peak || 0}</div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Broadcast Status</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {currentSession.is_live ? (
                <Badge variant="destructive">LIVE</Badge>
              ) : (
                <Badge variant="secondary">Offline</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encoder Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {profile?.encoder_active ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-500/10 text-gray-700 border-gray-500/20">
                  Inactive
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.staff_role || "Staff"}</div>
          </CardContent>
        </Card>
      </div>

      <Card
        className="cursor-pointer hover:bg-accent transition-colors"
        onClick={() => (window.location.href = "/staff/shows")}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Manage Your Shows
          </CardTitle>
          <CardDescription>Create and manage your show schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click here to add new shows, edit existing ones, and track approval status.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Guide</CardTitle>
          <CardDescription>How to start broadcasting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">1. Get your encoder credentials</h4>
            <p className="text-sm text-muted-foreground">
              Visit the Encoder Info page to view your connection details.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">2. Configure your broadcasting software</h4>
            <p className="text-sm text-muted-foreground">
              Use software like OBS, Mixxx, or BUTT to connect to the stream.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">3. Start broadcasting</h4>
            <p className="text-sm text-muted-foreground">
              Once connected, your live status will automatically appear on the main site.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
