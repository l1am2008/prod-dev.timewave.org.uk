"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Profile {
  username: string
  email: string
  first_name: string
  last_name: string
  bio: string
  avatar_url: string
  staff_role: string
  role: string
}

export default function ProfilePage() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
    avatar_url: "",
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/staff/profile", {
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
        })
      }
    } catch (error) {
      console.error("[v0] Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/staff/profile", {
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
        fetchProfile()
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
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">My Profile</h2>
        <p className="text-muted-foreground">Manage your public profile information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details (read-only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Username</Label>
              <p className="font-medium">{profile?.username}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{profile?.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Role</Label>
              <p className="font-medium capitalize">{profile?.role}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Staff Position</Label>
              <p className="font-medium">{profile?.staff_role || "Not assigned"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Information visible to listeners</CardDescription>
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
              <Label htmlFor="avatar_url">Avatar URL</Label>
              <Input
                id="avatar_url"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell listeners about yourself..."
                className="min-h-[100px]"
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
