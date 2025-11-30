import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { withAuth } from "@/lib/middleware"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const auth = await withAuth(["admin", "super_admin"])(request)
    if (auth instanceof NextResponse) {
      return auth
    }

    const users: any[] = await query(
      `SELECT 
        u.id, u.email, u.username, u.first_name, u.last_name, u.bio,
        u.role, u.staff_role, u.is_verified, u.newsletter_subscribed, 
        u.created_at, u.avatar_url, u.can_create_shows, u.can_create_articles,
        se.encoder_id, se.is_active as encoder_active
      FROM users u
      LEFT JOIN staff_encoders se ON u.id = se.user_id
      WHERE u.id = ?`,
      [id],
    )

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(users[0])
  } catch (error) {
    console.error("[Cymatic Group] Failed to fetch user details:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await withAuth(["admin", "super_admin"])(request)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const { role, staff_role, is_verified } = body

    if (role === "admin" && auth.user.role !== "super_admin") {
      return NextResponse.json({ error: "Only super admins can promote to admin" }, { status: 403 })
    }

    const updates: string[] = []
    const values: any[] = []

    if (role !== undefined) {
      updates.push("role = ?")
      values.push(role)
    }

    if (staff_role !== undefined) {
      updates.push("staff_role = ?")
      values.push(staff_role)
    }

    if (is_verified !== undefined) {
      updates.push("is_verified = ?")
      values.push(is_verified)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 })
    }

    values.push(id)

    await query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values)

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error) {
    console.error("[Cymatic Group] Failed to update user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const auth = await withAuth(["admin", "super_admin"])(request)
  if (auth instanceof NextResponse) return auth

  try {
    if (String(auth.user.id) === String(id)) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 })
    }

    const users: any[] = await query(
      "SELECT id, role, encoder_id FROM users LEFT JOIN staff_encoders ON users.id = staff_encoders.user_id WHERE users.id = ?",
      [id],
    )

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]

    if (user.role === "admin" && auth.user.role !== "super_admin") {
      return NextResponse.json({ error: "Only super admins can delete admin accounts" }, { status: 403 })
    }

    await query("DELETE FROM active_users WHERE user_id = ?", [id])
    await query("DELETE FROM password_resets WHERE user_id = ?", [id])
    await query("DELETE FROM profile_views WHERE viewer_id = ? OR viewed_user_id = ?", [id, id])
    await query("DELETE FROM song_requests WHERE user_id = ?", [id])
    await query("DELETE FROM articles WHERE author_id = ?", [id])
    await query("DELETE FROM shows WHERE user_id = ?", [id])
    await query("DELETE FROM staff_encoders WHERE user_id = ?", [id])
    await query("DELETE FROM newsletter_subscribers WHERE user_id = ?", [id])

    await query("DELETE FROM users WHERE id = ?", [id])

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("[Cymatic Group] Failed to delete user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
