import { NextResponse } from "next/server"
import { query } from "@/lib/db"

// Update user as active
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    let userId = null

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      try {
        const { verifyToken } = await import("@/lib/auth")
        const decoded = verifyToken(token)
        userId = decoded.id
      } catch (error) {
        // User not authenticated
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update or insert active user
    await query(
      `INSERT INTO active_users (user_id, last_seen, is_listening) 
       VALUES (?, NOW(), TRUE)
       ON DUPLICATE KEY UPDATE last_seen = NOW(), is_listening = TRUE`,
      [userId],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Failed to update active user:", error)
    return NextResponse.json({ error: "Failed to update active status" }, { status: 500 })
  }
}

// Get active users (listening in last 5 minutes)
export async function GET() {
  try {
    const activeUsers: any[] = await query(
      `SELECT u.id, u.username, u.first_name, u.last_name, u.avatar_url
       FROM active_users au
       INNER JOIN users u ON au.user_id = u.id
       WHERE au.last_seen >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
       AND au.is_listening = TRUE
       ORDER BY au.last_seen DESC
       LIMIT 50`,
      [],
    )

    return NextResponse.json(activeUsers)
  } catch (error) {
    console.error("[v0] Failed to fetch active users:", error)
    return NextResponse.json({ error: "Failed to fetch active users" }, { status: 500 })
  }
}
