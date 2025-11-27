"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Shield, User, Star } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AdminUser {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  role: string
  staff_role: string
  is_verified: boolean
  encoder_id: string
  encoder_active: boolean
  created_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  useEffect(() => {
    fetchUsers()
  }, [search, roleFilter])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("admin_token")
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (roleFilter !== "all") params.append("role", roleFilter)

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      super_admin: { variant: "destructive", icon: Star },
      admin: { variant: "default", icon: Shield },
      staff: { variant: "secondary", icon: User },
      user: { variant: "outline", icon: User },
    }

    const config = variants[role] || variants.user
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {role.replace("_", " ")}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage user accounts and roles</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by username, email, or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Staff Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Encoder</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.first_name || user.last_name
                      ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
                      : "-"}
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{user.staff_role || "-"}</TableCell>
                  <TableCell>
                    {user.is_verified ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                        Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.encoder_id ? (
                      <Badge variant={user.encoder_active ? "default" : "secondary"}>
                        {user.encoder_active ? "Active" : "Inactive"}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/users/${user.id}`}>
                      <Button variant="ghost" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
