"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Session {
  id: number
  encoder_id: string
  started_at: string
  ended_at: string
  is_live: boolean
  listeners_peak: number
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/staff/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (start: string, end: string | null) => {
    if (!end) return "In progress"

    const duration = new Date(end).getTime() - new Date(start).getTime()
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Broadcast History</h2>
        <p className="text-muted-foreground">Your previous broadcasting sessions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>Last 50 broadcasts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Peak Listeners</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading sessions...
                    </TableCell>
                  </TableRow>
                ) : sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No broadcast history yet
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        {new Date(session.started_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {new Date(session.started_at).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>{formatDuration(session.started_at, session.ended_at)}</TableCell>
                      <TableCell>{session.listeners_peak}</TableCell>
                      <TableCell>
                        {session.is_live ? (
                          <Badge variant="destructive">LIVE</Badge>
                        ) : (
                          <Badge variant="secondary">Ended</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
