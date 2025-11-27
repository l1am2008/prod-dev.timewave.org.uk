import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params

    const users: any[] = await query(
      `SELECT 
        u.id, u.username, u.first_name, u.last_name, u.avatar_url, u.bio,
        u.favorite_song_title, u.favorite_song_artist, u.favorite_song_itunes_id,
        u.favorite_song_artwork, u.role, u.staff_role, u.created_at,
        (SELECT COUNT(*) FROM user_friends WHERE user_id = u.id AND status = 'accepted') as friend_count
      FROM users u
      WHERE u.username = ?`,
      [username],
    )

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Don't expose sensitive info
    const profile = users[0]
    delete profile.email

    return NextResponse.json(profile)
  } catch (error) {
    console.error("[v0] Failed to fetch user profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
