"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { LogOut, Snowflake, Sparkles, Flower, Ghost } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const router = useRouter()
  const [activeTheme, setActiveTheme] = useState("default")
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user is super admin
    const checkRole = async () => {
      const token = localStorage.getItem("auth_token")
      if (!token) return

      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        setIsSuperAdmin(data.role === "super_admin")
      } catch (error) {
        console.error("Failed to check role:", error)
      }
    }

    // Fetch current theme
    const fetchTheme = async () => {
      try {
        const response = await fetch("/api/admin/settings/theme")
        const data = await response.json()
        setActiveTheme(data.theme || "default")
      } catch (error) {
        console.error("Failed to fetch theme:", error)
      }
    }

    checkRole()
    fetchTheme()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    router.push("/login")
  }

  const handleThemeChange = async (theme: string) => {
    setLoading(true)
    const token = localStorage.getItem("auth_token")

    try {
      const response = await fetch("/api/admin/settings/theme", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ theme }),
      })

      if (response.ok) {
        setActiveTheme(theme)
        window.dispatchEvent(new CustomEvent("themeChange", { detail: { theme } }))
        router.refresh()
        toast.success("Theme updated successfully!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update theme")
      }
    } catch (error) {
      toast.error("Failed to update theme")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your admin account</p>
      </div>

      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Seasonal Themes</CardTitle>
            <CardDescription>Choose a seasonal theme for the entire site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Active Theme</Label>
              <Select value={activeTheme} onValueChange={handleThemeChange} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    <div className="flex items-center gap-2">
                      <span>Default</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="christmas">
                    <div className="flex items-center gap-2">
                      <Snowflake className="h-4 w-4" />
                      <span>Christmas (Snow)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="newyear">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>New Year (Fireworks)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="spring">
                    <div className="flex items-center gap-2">
                      <Flower className="h-4 w-4" />
                      <span>Spring (Flowers)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="halloween">
                    <div className="flex items-center gap-2">
                      <Ghost className="h-4 w-4" />
                      <span>Halloween (Ghosts)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Theme effects will appear across the entire site</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your admin account preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" disabled placeholder="admin@timewave.uk" />
          </div>

          <div>
            <Label>Role</Label>
            <Input disabled placeholder="Administrator" />
          </div>

          <Button variant="destructive" onClick={handleLogout} className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>Information about the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Database</span>
            <span className="font-medium">MySQL</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">AzuraCast Integration</span>
            <span className="font-medium">Connected</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
