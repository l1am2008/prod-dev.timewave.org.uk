import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Missing verification token" }, { status: 400 })
    }

    // Find user with token
    const users: any[] = await query("SELECT id FROM users WHERE verification_token = ? AND is_verified = FALSE", [
      token,
    ])

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 })
    }

    // Update user as verified
    await query("UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = ?", [users[0].id])

    return NextResponse.json({ message: "Email verified successfully" })
  } catch (error) {
    console.error("[v0] Email verification error:", error)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
