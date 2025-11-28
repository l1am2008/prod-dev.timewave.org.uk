import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/middleware"
import { sendEmail, ArticleApprovedEmail, ArticleRejectedEmail } from "@/lib/email"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const authCheck = await requireAdmin(request)
  if (authCheck) return authCheck

  try {
    const { action, rejection_reason } = await request.json()
    const adminId = authCheck.user!.id

    const articles: any[] = await query(
      `SELECT a.*, u.email, u.first_name FROM articles a
      INNER JOIN users u ON a.user_id = u.id
      WHERE a.id = ?`,
      [params.id],
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
        [adminId, params.id],
      )

      await sendEmail({
        to: article.email,
        subject: "Your Article Has Been Approved - Timewave Radio",
        react: ArticleApprovedEmail({
          authorName: article.first_name || "there",
          articleTitle: article.title,
          articleSlug: article.slug,
        }),
      })
    } else if (action === "reject") {
      await query(
        `UPDATE articles 
        SET approval_status = 'rejected', rejection_reason = ?
        WHERE id = ?`,
        [rejection_reason, params.id],
      )

      await sendEmail({
        to: article.email,
        subject: "Article Update - Timewave Radio",
        react: ArticleRejectedEmail({
          authorName: article.first_name || "there",
          articleTitle: article.title,
          rejectionReason: rejection_reason,
        }),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Failed to process article:", error)
    return NextResponse.json({ error: "Failed to process article" }, { status: 500 })
  }
}
