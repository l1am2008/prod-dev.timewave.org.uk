import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/middleware"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await requireAdmin(request)
  if (!authCheck.valid) {
    return authCheck.response
  }

  try {
    const { id } = await params
    const articleId = Number.parseInt(id)

    if (!articleId) {
      return NextResponse.json({ error: "Invalid article ID" }, { status: 400 })
    }

    await query("DELETE FROM articles WHERE id = ?", [articleId])

    return NextResponse.json({
      success: true,
      message: "Article deleted successfully",
    })
  } catch (error) {
    console.error("[v0] Failed to delete article:", error)
    return NextResponse.json({ error: "Failed to delete article" }, { status: 500 })
  }
}
