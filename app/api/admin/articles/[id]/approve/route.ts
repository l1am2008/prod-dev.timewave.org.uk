import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/middleware"
import { sendArticleApprovalEmail } from "@/lib/email"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await requireAdmin(request)
  if (!authCheck.valid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id } = await params
    const { action, rejection_reason } = await request.json()
    const adminId = authCheck.user!.id

    const articles: any[] = await query(
      `SELECT a.*, u.email, u.first_name FROM articles a
      INNER JOIN users u ON a.user_id = u.id
      WHERE a.id = ?`,
      [id],
    )

    if (articles.length === 0) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    const article = articles[0]

    if (action === "approve") {
      await query(
        `UPDATE articles 
        SET approval_status = 'approved', approved_by = ?, approved_at = NOW(), published_at = NOW()
        WHERE id = ?`,
        [adminId, id],
      )

      await sendArticleApprovalEmail(article.email, article.first_name || "there", {
        title: article.title,
        slug: article.slug,
        approved: true,
      })
    } else if (action === "reject") {
      await query(
        `UPDATE articles 
        SET approval_status = 'rejected', rejection_reason = ?
        WHERE id = ?`,
        [rejection_reason, id],
      )

      await sendArticleApprovalEmail(article.email, article.first_name || "there", {
        title: article.title,
        slug: article.slug,
        approved: false,
        rejectionReason: rejection_reason,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Failed to process article:", error)
    return NextResponse.json({ error: "Failed to process article" }, { status: 500 })
  }
}
