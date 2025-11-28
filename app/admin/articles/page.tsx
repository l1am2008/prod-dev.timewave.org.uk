"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [selectedArticle, setSelectedArticle] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("pending")
  const { toast } = useToast()

  useEffect(() => {
    fetchArticles(activeTab)
  }, [activeTab])

  const fetchArticles = async (status: string) => {
    try {
      const response = await fetch(`/api/admin/articles?status=${status}`, {
        credentials: "include",
      })
      const data = await response.json()
      setArticles(data.articles || [])
    } catch (error) {
      console.error("Failed to fetch articles:", error)
    }
  }

  const handleApprove = async (articleId: number) => {
    setIsProcessing(true)
    try {
      const response = await fetch(`/api/admin/articles/${articleId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "approve" }),
      })

      if (response.ok) {
        toast({ title: "Success", description: "Article approved and published" })
        fetchArticles(activeTab)
      } else {
        toast({ title: "Error", description: "Failed to approve article", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve article", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedArticle || !rejectionReason) return

    setIsProcessing(true)
    try {
      const response = await fetch(`/api/admin/articles/${selectedArticle.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "reject", rejection_reason: rejectionReason }),
      })

      if (response.ok) {
        toast({ title: "Success", description: "Article rejected" })
        setSelectedArticle(null)
        setRejectionReason("")
        fetchArticles(activeTab)
      } else {
        toast({ title: "Error", description: "Failed to reject article", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject article", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Articles</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "pending" ? "Pending Approval" : activeTab === "approved" ? "Approved" : "Rejected"}{" "}
                Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              {articles.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No {activeTab} articles</p>
              ) : (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div key={article.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{article.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            By {article.first_name || article.username} •{" "}
                            {new Date(article.created_at).toLocaleDateString()}
                          </p>
                          {article.excerpt && <p className="text-sm mt-2">{article.excerpt}</p>}
                        </div>
                      </div>
                      {activeTab === "pending" && (
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" onClick={() => handleApprove(article.id)} disabled={isProcessing}>
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setSelectedArticle(article)}
                            disabled={isProcessing}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Article</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting "{selectedArticle?.title}"</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedArticle(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason || isProcessing}>
              Reject Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
