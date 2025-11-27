import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { withAuth } from "@/lib/middleware"
import { createEncoder } from "@/lib/azuracast"
import crypto from "crypto"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await withAuth(["admin", "super_admin"])(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { staff_role } = await request.json()

    if (!staff_role) {
      return NextResponse.json({ error: "Staff role is required" }, { status: 400 })
    }

    // Get user details
    const users: any[] = await query("SELECT * FROM users WHERE id = ?", [params.id])

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]

    // Check if user already has an encoder
    const existingEncoders: any[] = await query("SELECT * FROM staff_encoders WHERE user_id = ?", [params.id])

    if (existingEncoders.length > 0) {
      return NextResponse.json({ error: "User already has an encoder" }, { status: 400 })
    }

    // Generate a secure password for the encoder
    const encoderPassword = crypto.randomBytes(16).toString("hex")

    // Create encoder on AzuraCast
    const { encoder_id } = await createEncoder(user.username, encoderPassword)

    // Update user role to staff
    await query("UPDATE users SET role = ?, staff_role = ? WHERE id = ?", ["staff", staff_role, params.id])

    // Store encoder details
    await query("INSERT INTO staff_encoders (user_id, encoder_id, encoder_password) VALUES (?, ?, ?)", [
      params.id,
      encoder_id,
      encoderPassword,
    ])

    return NextResponse.json({
      message: "User promoted to staff successfully",
      encoder_id,
      encoderPassword,
    })
  } catch (error) {
    console.error("[v0] Failed to promote user to staff:", error)
    return NextResponse.json({ error: "Failed to promote user to staff" }, { status: 500 })
  }
}
