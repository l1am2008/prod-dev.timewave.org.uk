"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Show {
  id: number
  title: string
  description: string
  day_of_week: number
  start_time: string
  end_time: string
  is_recurring: boolean
  is_active: boolean
  approval_status: "pending" | "approved" | "rejected"
  rejection_reason?: string
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function ShowsManagement() {
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingShow, setEditingShow] = useState<Show | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    day_of_week: 0,
    start_time: "",
    end_time: "",
    is_recurring: true,
    is_active: true,
  })

  useEffect(() => {
    fetchShows()
  }, [])

  const fetchShows = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/shows", {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("auth_token")
      const url = editingShow ? `/api/shows/${editingShow.id}` : "/api/shows"
      const method = editingShow ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        resetForm()
        fetchShows()
      }
    } catch (error) {
      console.error("[v0] Failed to save show:", error)
    }
  }

  const handleEdit = (show: Show) => {
    setEditingShow(show)
    setFormData({
      title: show.title,
      description: show.description,
      day_of_week: show.day_of_week,
      start_time: show.start_time,
      end_time: show.end_time,
      is_recurring: show.is_recurring,
      is_active: show.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this show?")) return

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch(`/api/shows/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        fetchShows()
      }
    } catch (error) {
      console.error("[v0] Failed to delete show:", error)
    }
  }

  const resetForm = () => {
    setEditingShow(null)
    setFormData({
      title: "",
      description: "",
      day_of_week: 0,
      start_time: "",
      end_time: "",
      is_recurring: true,
      is_active: true,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending Approval</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return null
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">My Shows</h2>
          <p className="text-muted-foreground">Manage your show schedule</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Show
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingShow ? "Edit Show" : "Add New Show"}</DialogTitle>
              <DialogDescription>
                {editingShow
                  ? "Update your show details. Changes will require re-approval."
                  : "Create a new show. It will need approval from an admin before going live."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Show Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="day">Day of Week</Label>
                  <Select
                    value={formData.day_of_week.toString()}
                    onValueChange={(value) => setFormData({ ...formData, day_of_week: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Recurring</Label>
                  <Select
                    value={formData.is_recurring.toString()}
                    onValueChange={(value) => setFormData({ ...formData, is_recurring: value === "true" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Weekly</SelectItem>
                      <SelectItem value="false">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingShow ? "Update Show" : "Submit for Approval"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {shows.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No shows yet. Click "Add Show" to create your first show.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {shows.map((show) => (
            <Card key={show.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {show.title}
                      {getStatusBadge(show.approval_status)}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span>{DAYS[show.day_of_week]}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {show.start_time} - {show.end_time}
                      </span>
                      {show.is_recurring && <Badge variant="outline">Recurring</Badge>}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(show)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(show.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {show.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{show.description}</p>
                  {show.approval_status === "rejected" && show.rejection_reason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm font-medium text-red-900">Rejection Reason:</p>
                      <p className="text-sm text-red-700">{show.rejection_reason}</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
