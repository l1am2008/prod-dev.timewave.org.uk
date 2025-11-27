import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { hashPassword, generateVerificationToken } from "@/lib/auth"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, firstName, lastName, newsletterSubscribed } = await request.json()

    console.log("[v0] Registration attempt for:", { email, username })

    // Validate input
    if (!email || !password || !username) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Check if user already exists
    const existingUsers = await query("SELECT id FROM users WHERE email = ? OR username = ?", [email, username])

    if (existingUsers.length > 0) {
      console.log("[v0] User already exists:", { email, username })
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Hash password and generate verification token
    const passwordHash = await hashPassword(password)
    const verificationToken = generateVerificationToken()

    // Insert user
    await query(
      `INSERT INTO users (email, password_hash, username, first_name, last_name, verification_token, newsletter_subscribed)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        passwordHash,
        username,
        firstName || null,
        lastName || null,
        verificationToken,
        newsletterSubscribed || false,
      ],
    )

    console.log("[v0] User created successfully:", username)

    try {
      await sendVerificationEmail(email, verificationToken, username)
      console.log("[v0] Verification email sent")
    } catch (emailError) {
      console.log(
        "[v0] Failed to send verification email (non-critical):",
        emailError instanceof Error ? emailError.message : emailError,
      )
      // Continue - user is registered even if email fails
    }

    return NextResponse.json({
      message: "Registration successful. Please check your email to verify your account.",
    })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json(
      {
        error: "Registration failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
