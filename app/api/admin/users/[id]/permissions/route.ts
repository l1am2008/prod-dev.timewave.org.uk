import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/middleware"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await requireAdmin(request)
  if (!authCheck.valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const result = (await query(`SELECT can_create_shows, can_create_articles FROM users WHERE id = ?`, [
      id,
    ])) as Array<{ can_create_shows: boolean; can_create_articles: boolean }>

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      can_create_shows: Boolean(result[0].can_create_shows),
      can_create_articles: Boolean(result[0].can_create_articles),
    })
  } catch (error) {
    console.error("[Cymatic Group] Failed to fetch permissions:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch permissions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await requireAdmin(request)
  if (!authCheck.valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const can_create_shows = Boolean(body.can_create_shows) ? 1 : 0
    const can_create_articles = Boolean(body.can_create_articles) ? 1 : 0

    await query(
      `UPDATE users 
      SET can_create_shows = ?, can_create_articles = ?
      WHERE id = ?`,
      [can_create_shows, can_create_articles, id],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Cymatic Group] Failed to update permissions:", error)
    return NextResponse.json(
      {
        error: "Failed to update permissions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
