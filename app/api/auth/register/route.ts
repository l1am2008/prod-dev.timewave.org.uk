import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { hashPassword, generateVerificationToken } from "@/lib/auth"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, firstName, lastName, newsletterSubscribed } = await request.json()

    // Validate input
    if (!email || !password || !username) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const existingUsers = await query("SELECT id FROM users WHERE email = ? OR username = ?", [email, username])

    if (existingUsers.length > 0) {
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

    // Send verification email
    await sendVerificationEmail(email, verificationToken, username)

    return NextResponse.json({
      message: "Registration successful. Please check your email to verify your account.",
    })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
