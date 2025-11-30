import { query } from "@/lib/db"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function getArticle(slug: string) {
  try {
    const articles: any[] = await query(
      `SELECT 
        a.id, a.title, a.content, a.excerpt, a.featured_image, a.published_at,
        u.id as author_id, u.username, u.first_name, u.last_name, u.avatar_url, u.staff_role
      FROM articles a
      INNER JOIN users u ON a.user_id = u.id
      WHERE a.slug = ? AND a.approval_status = 'approved'`,
      [slug],
    )

    return articles.length > 0 ? articles[0] : null
  } catch (error) {
    console.error("[v0] Failed to fetch article:", error)
    return null
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const article = await getArticle(slug)

  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <article>
          {article.featured_image && (
            <img
              src={article.featured_image || "/placeholder.svg"}
              alt={article.title}
              className="w-full h-96 object-cover rounded-lg mb-8"
            />
          )}

          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

          <div className="flex items-center gap-3 mb-8 pb-8 border-b">
            <Link href={`/user/${article.username}`}>
              {article.avatar_url ? (
                <img
                  src={article.avatar_url || "/placeholder.svg"}
                  alt={article.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold">{article.username.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </Link>
            <div>
              <Link href={`/user/${article.username}`} className="font-medium hover:underline">
                {article.first_name && article.last_name
                  ? `${article.first_name} ${article.last_name}`
                  : article.username}
              </Link>
              <p className="text-sm text-muted-foreground">
                {new Date(article.published_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            {article.content.split("\n").map((paragraph: string, index: number) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>
      </div>
    </div>
  )
}
