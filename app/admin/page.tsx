"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Radio, Mail, Activity, Calendar } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeStaff: 0,
    newsletterSubs: 0,
    currentlyLive: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("admin_token")

      // Fetch all stats in parallel
      const [usersRes, newsletterRes, liveRes] = await Promise.all([
        fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/newsletter", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/live/current", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (usersRes.ok) {
        const users = await usersRes.json()
        const totalUsers = users.length
        const activeStaff = users.filter((u: any) => u.role === "staff" && u.encoder_id).length
        setStats((prev) => ({ ...prev, totalUsers, activeStaff }))
      }

      if (newsletterRes.ok) {
        const newsletter = await newsletterRes.json()
        setStats((prev) => ({ ...prev, newsletterSubs: newsletter.count }))
      }

      if (liveRes.ok) {
        const live = await liveRes.json()
        setStats((prev) => ({ ...prev, currentlyLive: live.length }))
      }
    } catch (error) {
      console.error("[v0] Failed to fetch dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your radio station</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "--" : stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Radio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "--" : stats.activeStaff}</div>
            <p className="text-xs text-muted-foreground">Staff members with encoders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Newsletter Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "--" : stats.newsletterSubs}</div>
            <p className="text-xs text-muted-foreground">Active subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Live</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "--" : stats.currentlyLive}</div>
            <p className="text-xs text-muted-foreground">Active broadcasts</p>
          </CardContent>
        </Card>
      </div>

      <Card
        className="cursor-pointer hover:bg-accent transition-colors"
        onClick={() => (window.location.href = "/admin/shows")}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Review Show Submissions
          </CardTitle>
          <CardDescription>Approve or reject presenter show requests</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click here to manage pending show approvals and view all scheduled shows.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Use the sidebar to navigate to different sections of the admin portal.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
