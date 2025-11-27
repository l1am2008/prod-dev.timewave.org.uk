"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, UserPlus } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface UserDetails {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  bio: string
  role: string
  staff_role: string
  is_verified: boolean
  encoder_id: string
  encoder_active: boolean
  created_at: string
}

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [promoting, setPromoting] = useState(false)
  const [role, setRole] = useState("")
  const [staffRole, setStaffRole] = useState("")

  useEffect(() => {
    fetchUser()
  }, [params.id])

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch(`/api/admin/users/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data)
        setRole(data.role)
        setStaffRole(data.staff_role || "")
      }
    } catch (error) {
      console.error("[v0] Failed to fetch user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role,
          staff_role: staffRole || null,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "User updated successfully",
        })
        fetchUser()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to update user",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePromoteToStaff = async () => {
    if (!staffRole) {
      toast({
        title: "Error",
        description: "Please enter a staff role first",
        variant: "destructive",
      })
      return
    }

    setPromoting(true)
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch(`/api/admin/users/${params.id}/promote-staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ staff_role: staffRole }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: `User promoted to staff. Encoder ID: ${data.encoder_id}`,
        })
        fetchUser()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to promote user",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to promote user",
        variant: "destructive",
      })
    } finally {
      setPromoting(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>User not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold">{user.username}</h2>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Basic user details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Username</Label>
              <p className="font-medium">{user.username}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">
                {user.first_name || user.last_name
                  ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                  : "Not provided"}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Verification Status</Label>
              <div className="mt-1">
                {user.is_verified ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                    Pending
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Member Since</Label>
              <p className="font-medium">
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>Manage user permissions and roles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>User Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Staff Role (if applicable)</Label>
              <Input
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value)}
                placeholder="e.g., Chair of Trustees, DJ, Host"
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>

            {user.role !== "staff" && !user.encoder_id && (
              <Button
                onClick={handlePromoteToStaff}
                disabled={promoting || !staffRole}
                variant="secondary"
                className="w-full"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {promoting ? "Creating Encoder..." : "Promote to Staff & Create Encoder"}
              </Button>
            )}
          </CardContent>
        </Card>

        {user.encoder_id && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Encoder Information</CardTitle>
              <CardDescription>AzuraCast encoder details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Encoder ID</Label>
                  <p className="font-mono font-medium">{user.encoder_id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge variant={user.encoder_active ? "default" : "secondary"}>
                      {user.encoder_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
