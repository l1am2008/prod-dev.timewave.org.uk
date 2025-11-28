import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { sendArticleSubmissionEmail } from "@/lib/email"

export async function GET() {
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

    return NextResponse.json({ articles })
  } catch (error) {
    console.error("[v0] Failed to fetch articles:", error)
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth_token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const userDetails: any[] = await query(`SELECT can_create_articles, role, first_name FROM users WHERE id = ?`, [
      user.id,
    ])

    if (
      !userDetails[0]?.can_create_articles &&
      userDetails[0]?.role !== "admin" &&
      userDetails[0]?.role !== "super_admin"
    ) {
      return NextResponse.json({ error: "No permission to create articles" }, { status: 403 })
    }

    const { title, content, excerpt, featured_image } = await request.json()

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    const isAdmin = userDetails[0]?.role === "admin" || userDetails[0]?.role === "super_admin"
    const approvalStatus = isAdmin ? "approved" : "pending"
    const publishedAt = isAdmin ? new Date() : null

    const result: any = await query(
      `INSERT INTO articles (user_id, title, slug, content, excerpt, featured_image, approval_status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.id, title, slug, content, excerpt, featured_image, approvalStatus, publishedAt],
    )

    if (!isAdmin) {
      const admins: any[] = await query(`SELECT email, first_name FROM users WHERE role IN ('admin', 'super_admin')`)

      const authorName = userDetails[0]?.first_name || user.username

      for (const admin of admins) {
        await sendArticleSubmissionEmail(admin.email, admin.first_name || "Admin", {
          title,
          authorName,
          articleId: result.insertId,
        })
      }
    }

    return NextResponse.json({
      success: true,
      articleId: result.insertId,
      requiresApproval: !isAdmin,
    })
  } catch (error) {
    console.error("[v0] Failed to create article:", error)
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 })
  }
}
