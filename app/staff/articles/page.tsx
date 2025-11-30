"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StaffArticlesPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canCreateArticles, setCanCreateArticles] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    featured_image: "",
  })

  useEffect(() => {
    fetchArticles()
    checkPermissions()
  }, [])

  const checkPermissions = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/user/permissions", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await response.json()
      setCanCreateArticles(data.can_create_articles)
    } catch (error) {
      console.error("Failed to check permissions:", error)
    }
  }

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/staff/articles", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const data = await response.json()
      setArticles(data.articles || [])
    } catch (error) {
      console.error("Failed to fetch articles:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: data.requiresApproval ? "Article submitted for approval" : "Article published successfully",
        })
        setFormData({ title: "", content: "", excerpt: "", featured_image: "" })
        fetchArticles()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit article",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit article",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!canCreateArticles) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              You don't have permission to create articles. Please contact an administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Articles</h1>

      <Tabs defaultValue="create">
        <TabsList>
          <TabsTrigger value="create">Create Article</TabsTrigger>
          <TabsTrigger value="my-articles">My Articles</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Article</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="featured_image">Featured Image URL</Label>
                  <Input
                    id="featured_image"
                    type="url"
                    value={formData.featured_image}
                    onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={15}
                    required
                  />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Article"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-articles">
          <Card>
            <CardHeader>
              <CardTitle>My Articles</CardTitle>
            </CardHeader>
            <CardContent>
              {articles.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No articles yet</p>
              ) : (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div key={article.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold">{article.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(article.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            article.approval_status === "approved"
                              ? "bg-green-100 text-green-800"
                              : article.approval_status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {article.approval_status}
                        </span>
                      </div>
                      {article.rejection_reason && (
                        <p className="text-sm text-red-600 mt-2">Reason: {article.rejection_reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
