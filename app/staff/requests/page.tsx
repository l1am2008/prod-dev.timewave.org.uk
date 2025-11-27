"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Music, Check, X, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SongRequest {
  id: number
  requester_name: string
  song_title: string
  artist_name: string
  message: string
  status: string
  created_at: string
  username?: string
  avatar_url?: string
}

export default function RequestsPage() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<SongRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")

  useEffect(() => {
    fetchRequests()
  }, [activeTab])

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/requests?status=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Request ${status}`,
        })
        fetchRequests()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive",
      })
    }
  }

  const deleteRequest = async (id: number) => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/requests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Request deleted",
        })
        fetchRequests()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete request",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "outline", className: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" },
      approved: { variant: "outline", className: "bg-green-500/10 text-green-700 border-green-500/20" },
      rejected: { variant: "outline", className: "bg-red-500/10 text-red-700 border-red-500/20" },
      played: { variant: "outline", className: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
    }
    return <Badge {...variants[status]}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Song Requests</h2>
        <p className="text-muted-foreground">Manage song requests from listeners</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="played">Played</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {loading ? (
            <div>Loading requests...</div>
          ) : requests.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No requests found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {request.song_title}
                        {getStatusBadge(request.status)}
                      </CardTitle>
                      <CardDescription>
                        by {request.artist_name} • Requested by {request.requester_name || "Anonymous"}
                      </CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">{new Date(request.created_at).toLocaleString()}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  {request.message && <p className="text-sm mb-4 p-3 bg-muted rounded-lg">{request.message}</p>}

                  <div className="flex gap-2">
                    {request.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(request.id, "approved")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(request.id, "rejected")}>
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    {request.status === "approved" && (
                      <Button size="sm" onClick={() => updateStatus(request.id, "played")}>
                        Mark as Played
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => deleteRequest(request.id)} className="ml-auto">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
