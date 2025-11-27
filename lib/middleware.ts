import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "./auth"

export function withAuth(allowedRoles: string[]) {
  return async (request: NextRequest) => {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = verifyToken(token)

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return { user }
  }
}
