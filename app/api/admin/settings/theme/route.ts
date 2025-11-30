import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/middleware"

export async function GET() {
  try {
    const result = await query("SELECT setting_value FROM site_settings WHERE setting_key = 'active_theme'")

    const theme = result.length > 0 ? result[0].setting_value : "default"

    return NextResponse.json({ theme })
  } catch (error) {
    console.error("[v0] Failed to fetch theme:", error)
    return NextResponse.json({ theme: "default" })
  }
}

export async function PUT(request: Request) {
  const authCheck = await requireAdmin(request)

  if (!authCheck.valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only super_admin can change themes
  if (authCheck.user.role !== "super_admin") {
    return NextResponse.json({ error: "Only super admins can change themes" }, { status: 403 })
  }

  try {
    const { theme } = await request.json()

    await query(
      `INSERT INTO site_settings (setting_key, setting_value, updated_by) 
       VALUES ('active_theme', ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = ?, updated_by = ?`,
      [theme, authCheck.user.id, theme, authCheck.user.id],
    )

    return NextResponse.json({ success: true, theme })
  } catch (error) {
    console.error("[v0] Failed to update theme:", error)
    return NextResponse.json({ error: "Failed to update theme" }, { status: 500 })
  }
}
