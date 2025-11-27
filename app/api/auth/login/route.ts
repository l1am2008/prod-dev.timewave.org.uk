import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 })
    }

    // Find user
    const users: any[] = await query(
      "SELECT id, email, password_hash, username, role, is_verified FROM users WHERE email = ?",
      [email],
    )

    if (users.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if verified
    if (!user.is_verified) {
      return NextResponse.json({ error: "Please verify your email before logging in" }, { status: 403 })
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
