import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const articles: any[] = await query(
      `SELECT 
        a.id, a.title, a.content, a.excerpt, a.featured_image, a.published_at,
        u.id as author_id, u.username, u.first_name, u.last_name, u.avatar_url, u.staff_role
      FROM articles a
      INNER JOIN users u ON a.user_id = u.id
      WHERE a.slug = ? AND a.approval_status = 'approved'`,
      [params.slug],
    )

    if (articles.length === 0) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    return NextResponse.json({ article: articles[0] })
  } catch (error) {
    console.error("[v0] Failed to fetch article:", error)
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 })
  }
}
