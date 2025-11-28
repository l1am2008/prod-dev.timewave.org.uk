import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/middleware"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authCheck = await requireAdmin(request)
  if (authCheck) return authCheck

  try {
    const { can_create_shows, can_create_articles } = await request.json()

    await query(
      `UPDATE users 
      SET can_create_shows = ?, can_create_articles = ?
      WHERE id = ?`,
      [can_create_shows, can_create_articles, params.id],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Failed to update permissions:", error)
    return NextResponse.json({ error: "Failed to update permissions" }, { status: 500 })
  }
}
