import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// Submit a song request
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { song_title, artist_name, message, requester_name } = body

    // Validate required fields
    if (!song_title || !artist_name) {
      return NextResponse.json({ error: "Song title and artist are required" }, { status: 400 })
    }

    // Check if user is authenticated
    const authHeader = request.headers.get("authorization")
    let userId = null

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      try {
        const { verifyToken } = await import("@/lib/auth")
        const decoded = verifyToken(token)
        userId = decoded.id
      } catch (error) {
        // Not authenticated, that's okay for requests
        console.log("[v0] Request submitted without auth")
      }
    }

    await query(
      `INSERT INTO song_requests (user_id, requester_name, song_title, artist_name, message, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [userId, requester_name || "Anonymous", song_title, artist_name, message || null],
    )

    return NextResponse.json({ success: true, message: "Request submitted successfully" })
  } catch (error) {
    console.error("[v0] Request submission error:", error)
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 })
  }
}

// Get all requests (for staff/admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"

    let sqlQuery = `
      SELECT sr.*, u.username, u.avatar_url
      FROM song_requests sr
      LEFT JOIN users u ON sr.user_id = u.id
    `

    const params: any[] = []

    if (status !== "all") {
      sqlQuery += ` WHERE sr.status = ?`
      params.push(status)
    }

    sqlQuery += ` ORDER BY sr.created_at DESC LIMIT 100`

    const requests: any[] = await query(sqlQuery, params)

    return NextResponse.json(requests)
  } catch (error) {
    console.error("[v0] Failed to fetch requests:", error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}
