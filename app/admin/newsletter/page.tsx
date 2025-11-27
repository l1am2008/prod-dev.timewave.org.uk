"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Send, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NewsletterPage() {
  const { toast } = useToast()
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch("/api/admin/newsletter", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSubscriberCount(data.count)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch subscribers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!subject || !content) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setSending(true)
    try {
      const token = localStorage.getItem("admin_token")
      const response = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, content }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Newsletter sent successfully",
        })
        setSubject("")
        setContent("")
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to send newsletter",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send newsletter",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Newsletter</h2>
        <p className="text-muted-foreground">Send emails to all subscribers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Subscribers
          </CardTitle>
          <CardDescription>Total newsletter subscribers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{loading ? "--" : subscriberCount}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compose Newsletter</CardTitle>
          <CardDescription>Create and send a newsletter to all subscribers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Newsletter subject line"
            />
          </div>

          <div>
            <Label htmlFor="content">Content (HTML supported)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Newsletter content..."
              className="min-h-[300px] font-mono"
            />
          </div>

          <Button onClick={handleSend} disabled={sending || !subject || !content} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            {sending ? "Sending..." : `Send to ${subscriberCount} Subscribers`}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
