import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/middleware"

export async function GET(request: Request) {
  try {
    const authResult = await verifyToken(request)

    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users: any[] = await query(
      `SELECT id, username, email, first_name, last_name, role, created_at
       FROM users WHERE id = ?`,
      [authResult.user.id],
    )

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]
    return NextResponse.json({
      ...user,
      avatar_url: user.avatar_url || null,
      bio: user.bio || null,
      favorite_song_title: user.favorite_song_title || null,
      favorite_song_artist: user.favorite_song_artist || null,
      favorite_song_itunes_id: user.favorite_song_itunes_id || null,
      favorite_song_artwork: user.favorite_song_artwork || null,
    })
  } catch (error) {
    console.error("[Cymatic Group] Profile fetch error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch profile",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const authResult = await verifyToken(request)
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      first_name,
      last_name,
      bio,
      avatar_url,
      favorite_song_title,
      favorite_song_artist,
      favorite_song_itunes_id,
      favorite_song_artwork,
    } = body

    const updates: string[] = []
    const values: any[] = []

    if (first_name !== undefined) {
      updates.push("first_name = ?")
      values.push(first_name)
    }
    if (last_name !== undefined) {
      updates.push("last_name = ?")
      values.push(last_name)
    }
    if (bio !== undefined) {
      updates.push("bio = ?")
      values.push(bio)
    }
    if (avatar_url !== undefined) {
      updates.push("avatar_url = ?")
      values.push(avatar_url)
    }
    if (favorite_song_title !== undefined) {
      updates.push("favorite_song_title = ?")
      values.push(favorite_song_title)
    }
    if (favorite_song_artist !== undefined) {
      updates.push("favorite_song_artist = ?")
      values.push(favorite_song_artist)
    }
    if (favorite_song_itunes_id !== undefined) {
      updates.push("favorite_song_itunes_id = ?")
      values.push(favorite_song_itunes_id)
    }
    if (favorite_song_artwork !== undefined) {
      updates.push("favorite_song_artwork = ?")
      values.push(favorite_song_artwork)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 })
    }

    values.push(authResult.user.id)
    await query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values)

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("[Cymatic Group] Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
