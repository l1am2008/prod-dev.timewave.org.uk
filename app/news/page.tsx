import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { query } from "@/lib/db"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function getArticles() {
  try {
    const articles: any[] = await query(
      `SELECT 
        a.id, a.title, a.slug, a.excerpt, a.featured_image, a.published_at,
        u.username, u.first_name, u.last_name, u.avatar_url
      FROM articles a
      INNER JOIN users u ON a.user_id = u.id
      WHERE a.approval_status = 'approved'
      ORDER BY a.published_at DESC
      LIMIT 20`,
    )

    return articles
  } catch (error) {
    console.error("[v0] Failed to fetch articles:", error)
    return []
  }
}

export default async function NewsPage() {
  const articles = await getArticles()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">News</h1>

        {articles.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">No articles published yet</CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article: any) => (
              <Link key={article.id} href={`/news/${article.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  {article.featured_image && (
                    <img
                      src={article.featured_image || "/placeholder.svg"}
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3 mb-4">{article.excerpt}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {article.avatar_url && (
                        <img
                          src={article.avatar_url || "/placeholder.svg"}
                          alt={article.username}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span>
                        {article.first_name && article.last_name
                          ? `${article.first_name} ${article.last_name}`
                          : article.username}
                      </span>
                      <span>•</span>
                      <span>{new Date(article.published_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
