import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./auth"

export function withAuth(allowedRoles: string[]) {
  return async (request: NextRequest) => {
    console.log("[v0] Auth middleware called for roles:", allowedRoles)

    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[v0] No auth header or invalid format")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    console.log("[v0] Attempting to verify token...")

    try {
      const user = verifyToken(token)

      if (!user) {
        console.log("[v0] Token verification failed")
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }

      console.log("[v0] Token verified for user:", user.id, "Role:", user.role)

      if (!allowedRoles.includes(user.role)) {
        console.log("[v0] User role not authorized:", user.role)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      console.log("[v0] Auth successful")
      return { user }
    } catch (error) {
      console.error("[v0] Auth middleware error:", error)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }
  }
}
