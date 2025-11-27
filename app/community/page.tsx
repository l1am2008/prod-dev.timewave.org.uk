"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Radio, UsersIcon } from "lucide-react"
import Link from "next/link"

interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  bio: string
  avatar_url: string
  role: string
  staff_role?: string
  total_shows?: number
  is_live?: boolean
}

export default function CommunityPage() {
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [staffUsers, setStaffUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCommunity() {
      try {
        const [allRes, staffRes] = await Promise.all([fetch("/api/community/all"), fetch("/api/community/staff")])

        if (allRes.ok) setAllUsers(await allRes.json())
        if (staffRes.ok) setStaffUsers(await staffRes.json())
      } catch (error) {
        console.error("[v0] Failed to fetch community:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCommunity()
  }, [])

  const UserCard = ({ user }: { user: User }) => (
    <Link key={user.id} href={`/user/${user.username}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url || "/placeholder.svg"}
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold">{user.username.charAt(0).toUpperCase()}</span>
                </div>
              )}
              <div>
                <CardTitle className="text-lg">
                  {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                </CardTitle>
                <CardDescription className="text-sm">@{user.username}</CardDescription>
              </div>
            </div>
            {user.is_live && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {user.staff_role && <p className="text-sm font-medium text-primary mb-2">{user.staff_role}</p>}
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{user.bio || "No bio available"}</p>
          {user.total_shows !== undefined && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Radio className="h-3 w-3" />
              <span>{user.total_shows} shows</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-4 bg-muted rounded w-1/3" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Community</h2>
          <p className="text-muted-foreground">Connect with our amazing community members</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="all">
              <UsersIcon className="h-4 w-4 mr-2" />
              All Users
            </TabsTrigger>
            <TabsTrigger value="staff">
              <Radio className="h-4 w-4 mr-2" />
              Staff
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {allUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
              {allUsers.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="staff" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {staffUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
              {staffUsers.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No staff members found</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
