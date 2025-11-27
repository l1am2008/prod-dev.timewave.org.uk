import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { withAuth } from "@/lib/middleware"

export async function GET(request: NextRequest) {
  const auth = await withAuth(["staff", "admin", "super_admin"])(request)
  if (auth instanceof NextResponse) return auth

  try {
    const users: any[] = await query(
      `SELECT 
        u.id, u.email, u.username, u.first_name, u.last_name, u.bio,
        u.role, u.staff_role, u.avatar_url, u.created_at,
        se.encoder_id, se.encoder_password, se.is_active as encoder_active
      FROM users u
      LEFT JOIN staff_encoders se ON u.id = se.user_id
      WHERE u.id = ?`,
      [auth.user.id],
    )

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(users[0])
  } catch (error) {
    console.error("[v0] Failed to fetch profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await withAuth(["staff", "admin", "super_admin"])(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { first_name, last_name, bio, avatar_url } = body

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

    if (updates.length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 })
    }

    values.push(auth.user.id)

    await query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values)

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("[v0] Failed to update profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
