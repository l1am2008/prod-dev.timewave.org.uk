"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Radio, Newspaper, UsersIcon } from "lucide-react"
import Link from "next/link"

interface CommunityUser {
  id: number
  username: string
  first_name: string
  last_name: string
  bio: string
  avatar_url: string
  staff_role?: string
  is_live?: boolean
}

export default function MobileCommunityPage() {
  const [allUsers, setAllUsers] = useState<CommunityUser[]>([])
  const [staffUsers, setStaffUsers] = useState<CommunityUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCommunity() {
      try {
        const [allRes, staffRes] = await Promise.all([fetch("/api/community/all"), fetch("/api/community/staff")])
        if (allRes.ok) setAllUsers(await allRes.json())
        if (staffRes.ok) setStaffUsers(await staffRes.json())
      } catch (error) {
        console.error("Failed to fetch community:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCommunity()
  }, [])

  const UserCard = ({ user }: { user: CommunityUser }) => (
    <Link key={user.id} href={`/user/${user.username}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <div className="flex gap-3">
            {user.avatar_url ? (
              <img
                src={user.avatar_url || "/placeholder.svg"}
                alt={user.username}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <UsersIcon className="h-6 w-6" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">
                  {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                </h3>
                {user.is_live && (
                  <Badge variant="destructive" className="text-xs px-1 py-0">
                    LIVE
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
              {user.staff_role && <p className="text-xs text-primary font-medium mt-1">{user.staff_role}</p>}
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{user.bio || "No bio available"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <UsersIcon className="h-5 w-5" />
          Community
        </h1>
      </header>

      <main className="p-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="all" className="text-xs">
              All Users
            </TabsTrigger>
            <TabsTrigger value="staff" className="text-xs">
              Staff
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-0">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : allUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No users found</p>
            ) : (
              allUsers.map((user) => <UserCard key={user.id} user={user} />)
            )}
          </TabsContent>

          <TabsContent value="staff" className="space-y-3 mt-0">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : staffUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No staff found</p>
            ) : (
              staffUsers.map((user) => <UserCard key={user.id} user={user} />)
            )}
          </TabsContent>
        </Tabs>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 flex justify-around">
        <Link href="/mobile" className="flex flex-col items-center gap-1 text-muted-foreground">
          <Radio className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </Link>
        <Link href="/mobile/schedule" className="flex flex-col items-center gap-1 text-muted-foreground">
          <Calendar className="h-5 w-5" />
          <span className="text-xs">Schedule</span>
        </Link>
        <Link href="/mobile/news" className="flex flex-col items-center gap-1 text-muted-foreground">
          <Newspaper className="h-5 w-5" />
          <span className="text-xs">News</span>
        </Link>
        <Link href="/mobile/community" className="flex flex-col items-center gap-1">
          <UsersIcon className="h-5 w-5" />
          <span className="text-xs">Community</span>
        </Link>
      </nav>
    </div>
  )
}
