import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/middleware"

// Get user's friends list
export async function GET(request: Request) {
  try {
    const authResult = await verifyToken(request)
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const friends = await query(
      `SELECT 
        u.id, u.username, u.first_name, u.last_name, u.avatar_url,
        uf.status, uf.created_at
      FROM user_friends uf
      JOIN users u ON u.id = uf.friend_id
      WHERE uf.user_id = ? AND uf.status = 'accepted'
      ORDER BY u.username`,
      [authResult.user.id],
    )

    return NextResponse.json(friends)
  } catch (error) {
    console.error("[v0] Failed to fetch friends:", error)
    return NextResponse.json({ error: "Failed to fetch friends" }, { status: 500 })
  }
}

// Send friend request
export async function POST(request: Request) {
  try {
    const authResult = await verifyToken(request)
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { friend_id } = await request.json()

    if (!friend_id) {
      return NextResponse.json({ error: "Friend ID required" }, { status: 400 })
    }

    if (friend_id === authResult.user.id) {
      return NextResponse.json({ error: "Cannot friend yourself" }, { status: 400 })
    }

    // Check if friendship already exists
    const existing = await query("SELECT id FROM user_friends WHERE user_id = ? AND friend_id = ?", [
      authResult.user.id,
      friend_id,
    ])

    if (existing.length > 0) {
      return NextResponse.json({ error: "Friend request already sent" }, { status: 409 })
    }

    await query("INSERT INTO user_friends (user_id, friend_id, status) VALUES (?, ?, 'accepted')", [
      authResult.user.id,
      friend_id,
    ])

    // Create reciprocal friendship
    await query("INSERT INTO user_friends (user_id, friend_id, status) VALUES (?, ?, 'accepted')", [
      friend_id,
      authResult.user.id,
    ])

    return NextResponse.json({ message: "Friend added successfully" })
  } catch (error) {
    console.error("[v0] Failed to add friend:", error)
    return NextResponse.json({ error: "Failed to add friend" }, { status: 500 })
  }
}
