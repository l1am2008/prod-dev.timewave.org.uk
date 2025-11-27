"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, X, Clock, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Show {
  id: number
  title: string
  description: string
  day_of_week: number
  start_time: string
  end_time: string
  approval_status: string
  username: string
  first_name: string
  last_name: string
  email: string
  approved_by_username?: string
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function AdminShowsManagement() {
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedShow, setSelectedShow] = useState<Show | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)

  useEffect(() => {
    fetchShows()
  }, [])

  const fetchShows = async () => {
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch("/api/admin/shows", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setShows(data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch shows:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (showId: number) => {
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch(`/api/admin/shows/${showId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ approved: true }),
      })

      if (response.ok) {
        fetchShows()
      }
    } catch (error) {
      console.error("[v0] Failed to approve show:", error)
    }
  }

  const handleReject = async () => {
    if (!selectedShow) return

    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch(`/api/admin/shows/${selectedShow.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ approved: false, rejection_reason: rejectionReason }),
      })

      if (response.ok) {
        setIsRejectDialogOpen(false)
        setRejectionReason("")
        setSelectedShow(null)
        fetchShows()
      }
    } catch (error) {
      console.error("[v0] Failed to reject show:", error)
    }
  }

  const openRejectDialog = (show: Show) => {
    setSelectedShow(show)
    setIsRejectDialogOpen(true)
  }

  const renderShow = (show: Show) => (
    <Card key={show.id}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {show.title}
              {show.approval_status === "pending" && <Badge className="bg-yellow-500">Pending</Badge>}
              {show.approval_status === "approved" && <Badge className="bg-green-500">Approved</Badge>}
              {show.approval_status === "rejected" && <Badge variant="destructive">Rejected</Badge>}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {show.first_name} {show.last_name} (@{show.username})
              </span>
              <span>{DAYS[show.day_of_week]}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {show.start_time} - {show.end_time}
              </span>
            </CardDescription>
          </div>
          {show.approval_status === "pending" && (
            <div className="flex gap-2">
              <Button size="sm" variant="default" onClick={() => handleApprove(show.id)}>
                <Check className="mr-1 h-4 w-4" />
                Approve
              </Button>
              <Button size="sm" variant="destructive" onClick={() => openRejectDialog(show)}>
                <X className="mr-1 h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      {show.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{show.description}</p>
          {show.approved_by_username && (
            <p className="text-xs text-muted-foreground mt-2">Approved by: {show.approved_by_username}</p>
          )}
        </CardContent>
      )}
    </Card>
  )

  const pendingShows = shows.filter((s) => s.approval_status === "pending")
  const approvedShows = shows.filter((s) => s.approval_status === "approved")
  const rejectedShows = shows.filter((s) => s.approval_status === "rejected")

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Show Management</h2>
        <p className="text-muted-foreground">Review and approve show submissions</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pending {pendingShows.length > 0 && `(${pendingShows.length})`}</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Shows</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingShows.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">No pending shows</CardContent>
            </Card>
          ) : (
            pendingShows.map(renderShow)
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedShows.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">No approved shows</CardContent>
            </Card>
          ) : (
            approvedShows.map(renderShow)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedShows.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">No rejected shows</CardContent>
            </Card>
          ) : (
            rejectedShows.map(renderShow)
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {shows.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">No shows found</CardContent>
            </Card>
          ) : (
            shows.map(renderShow)
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Show</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this show. The presenter will receive this feedback.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="E.g., Time slot conflict, inappropriate content, etc."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Show
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
