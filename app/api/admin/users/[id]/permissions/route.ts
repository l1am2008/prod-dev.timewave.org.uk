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
  console.log("[v0] PUT request received for permissions")
  console.log("[v0] Params:", JSON.stringify(params))
  console.log("[v0] params.id:", params.id, "type:", typeof params.id)

  const authCheck = await requireAdmin(request)
  if (!authCheck.valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    console.log("[v0] Raw request body:", JSON.stringify(body))
    console.log("[v0] Body keys:", Object.keys(body))
    console.log("[v0] body.can_create_shows:", body.can_create_shows, "type:", typeof body.can_create_shows)
    console.log("[v0] body.can_create_articles:", body.can_create_articles, "type:", typeof body.can_create_articles)

    if (!params.id) {
      console.error("[v0] params.id is undefined or empty!")
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const can_create_shows = body.can_create_shows === true ? 1 : 0
    const can_create_articles = body.can_create_articles === true ? 1 : 0

    console.log(
      "[v0] Converted values - can_create_shows:",
      can_create_shows,
      "can_create_articles:",
      can_create_articles,
    )
    console.log("[v0] Updating permissions for user:", params.id)

    const queryParams = [can_create_shows, can_create_articles, params.id]
    console.log("[v0] Query params array:", JSON.stringify(queryParams))
    console.log(
      "[v0] Query params types:",
      queryParams.map((p) => typeof p),
    )

    await query(
      `UPDATE users 
      SET can_create_shows = ?, can_create_articles = ?
      WHERE id = ?`,
      queryParams,
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
