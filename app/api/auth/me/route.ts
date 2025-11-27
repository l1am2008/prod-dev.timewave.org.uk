import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    return NextResponse.json({
      id: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    })
  } catch (error) {
    console.error("[v0] Auth me error:", error)
    return NextResponse.json({ error: "Failed to get user info" }, { status: 500 })
  }
}
