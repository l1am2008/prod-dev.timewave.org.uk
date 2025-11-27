import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/middleware"

// Remove friend
export async function DELETE(request: Request, { params }: { params: Promise<{ friendId: string }> }) {
  try {
    const authResult = await verifyToken(request)
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { friendId } = await params

    // Remove both directions of friendship
    await query("DELETE FROM user_friends WHERE user_id = ? AND friend_id = ?", [authResult.user.id, friendId])

    await query("DELETE FROM user_friends WHERE user_id = ? AND friend_id = ?", [friendId, authResult.user.id])

    return NextResponse.json({ message: "Friend removed successfully" })
  } catch (error) {
    console.error("[v0] Failed to remove friend:", error)
    return NextResponse.json({ error: "Failed to remove friend" }, { status: 500 })
  }
}
