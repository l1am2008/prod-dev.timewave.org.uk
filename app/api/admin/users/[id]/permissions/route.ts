import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/middleware"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authCheck = await requireAdmin(request)
  if (authCheck) return authCheck

  try {
    const result = (await query(`SELECT can_create_shows, can_create_articles FROM users WHERE id = ?`, [
      params.id,
    ])) as Array<{ can_create_shows: boolean; can_create_articles: boolean }>

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      can_create_shows: Boolean(result[0].can_create_shows),
      can_create_articles: Boolean(result[0].can_create_articles),
    })
  } catch (error) {
    console.error("[v0] Failed to fetch permissions:", error)
    return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 })
  }
}

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
