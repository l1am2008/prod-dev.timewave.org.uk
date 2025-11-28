import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/middleware"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authCheck = await requireAdmin(request)
  if (!authCheck.valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    console.log("[v0] Fetching permissions for user:", params.id)
    const result = (await query(`SELECT can_create_shows, can_create_articles FROM users WHERE id = ?`, [
      params.id,
    ])) as Array<{ can_create_shows: boolean; can_create_articles: boolean }>

    if (!result || result.length === 0) {
      console.log("[v0] User not found:", params.id)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("[v0] Permissions fetched successfully:", result[0])
    return NextResponse.json({
      can_create_shows: Boolean(result[0].can_create_shows),
      can_create_articles: Boolean(result[0].can_create_articles),
    })
  } catch (error) {
    console.error("[v0] Failed to fetch permissions - Error details:", {
      message: error instanceof Error ? error.message : String(error),
      code: (error as any).code,
      errno: (error as any).errno,
      sqlMessage: (error as any).sqlMessage,
      sql: (error as any).sql,
    })
    return NextResponse.json(
      {
        error: "Failed to fetch permissions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authCheck = await requireAdmin(request)
  if (!authCheck.valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { can_create_shows, can_create_articles } = await request.json()
    console.log("[v0] Updating permissions for user:", params.id, { can_create_shows, can_create_articles })

    await query(
      `UPDATE users 
      SET can_create_shows = ?, can_create_articles = ?
      WHERE id = ?`,
      [can_create_shows, can_create_articles, params.id],
    )

    console.log("[v0] Permissions updated successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Failed to update permissions - Error details:", {
      message: error instanceof Error ? error.message : String(error),
      code: (error as any).code,
      errno: (error as any).errno,
      sqlMessage: (error as any).sqlMessage,
      sql: (error as any).sql,
    })
    return NextResponse.json(
      {
        error: "Failed to update permissions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
