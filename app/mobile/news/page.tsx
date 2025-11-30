import { Card, CardContent } from "@/components/ui/card"
import { query } from "@/lib/db"
import Link from "next/link"
import { Calendar, Radio, Newspaper, Users } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function getArticles() {
  try {
    const articles: any[] = await query(
      `SELECT 
        a.id, a.title, a.slug, a.excerpt, a.featured_image, a.published_at,
        u.username, u.first_name, u.last_name
      FROM articles a
      INNER JOIN users u ON a.user_id = u.id
      WHERE a.approval_status = 'approved'
      ORDER BY a.published_at DESC
      LIMIT 20`,
    )
    return articles
  } catch (error) {
    return []
  }
}

export default async function MobileNewsPage() {
  const articles = await getArticles()

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-10">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          News
        </h1>
      </header>

      <main className="p-4 space-y-3">
        {articles.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No articles yet</p>
        ) : (
          articles.map((article) => (
            <Link key={article.id} href={`/news/${article.slug}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    {article.featured_image && (
                      <img
                        src={article.featured_image || "/placeholder.svg"}
                        alt={article.title}
                        className="w-20 h-20 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1">{article.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{article.excerpt}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>
                          {article.first_name && article.last_name
                            ? `${article.first_name} ${article.last_name}`
                            : article.username}
                        </span>
                        <span>•</span>
                        <span>{new Date(article.published_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
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
        <Link href="/mobile/news" className="flex flex-col items-center gap-1">
          <Newspaper className="h-5 w-5" />
          <span className="text-xs">News</span>
        </Link>
        <Link href="/mobile/community" className="flex flex-col items-center gap-1 text-muted-foreground">
          <Users className="h-5 w-5" />
          <span className="text-xs">Community</span>
        </Link>
      </nav>
    </div>
  )
}
