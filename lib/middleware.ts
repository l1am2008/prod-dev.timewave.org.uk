import { type NextRequest, NextResponse } from "next/server"
import { verifyToken as jwtVerifyToken, type UserPayload } from "./auth"

export async function verifyToken(request: Request): Promise<{ valid: boolean; user: UserPayload | null }> {
  let token: string | null = null

  // Try Authorization header first
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7)
  }

  // Fallback to cookies if no Authorization header
  if (!token && "cookies" in request) {
    const cookieStore = (request as any).cookies
    const authCookie = cookieStore.get("auth_token")
    token = authCookie?.value || null
  }

  if (!token) {
    return { valid: false, user: null }
  }

  try {
    const user = jwtVerifyToken(token)

    if (!user) {
      return { valid: false, user: null }
    }

    return { valid: true, user }
  } catch (error) {
    console.error("[Cymatic Group] verifyToken error:", error)
    return { valid: false, user: null }
  }
}

export function withAuth(allowedRoles: string[]) {
  return async (request: NextRequest) => {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    try {
      const user = jwtVerifyToken(token)

      if (!user) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }

      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }

      return { user }
    } catch (error) {
      console.error("[Cymatic Group] Auth middleware error:", error)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }
  }
}

export async function requireStaff(request: Request) {
  let token: string | null = null

  // Try Authorization header first
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7)
  }

  // Fallback to cookies if no Authorization header
  if (!token && "cookies" in request) {
    const cookieStore = (request as any).cookies
    const authCookie = cookieStore.get("auth_token")
    token = authCookie?.value || null
  }

  if (!token) {
    return { valid: false, user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  try {
    const user = jwtVerifyToken(token)

    if (!user) {
      return { valid: false, user: null, response: NextResponse.json({ error: "Invalid token" }, { status: 401 }) }
    }

    if (!["staff", "admin", "super_admin"].includes(user.role)) {
      return { valid: false, user: null, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
    }

    return { valid: true, user }
  } catch (error) {
    console.error("[Cymatic Group] requireStaff error:", error)
    return {
      valid: false,
      user: null,
      response: NextResponse.json({ error: "Authentication failed" }, { status: 401 }),
    }
  }
}

export async function requireAdmin(request: Request) {
  let token: string | null = null

  // Try Authorization header first
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7)
  }

  // Fallback to cookies if no Authorization header
  if (!token && "cookies" in request) {
    const cookieStore = (request as any).cookies
    const authCookie = cookieStore.get("auth_token")
    token = authCookie?.value || null
  }

  if (!token) {
    return { valid: false, user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  try {
    const user = jwtVerifyToken(token)

    if (!user) {
      return { valid: false, user: null, response: NextResponse.json({ error: "Invalid token" }, { status: 401 }) }
    }

    if (!["admin", "super_admin"].includes(user.role)) {
      return { valid: false, user: null, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
    }

    return { valid: true, user }
  } catch (error) {
    console.error("[Cymatic Group] requireAdmin error:", error)
    return {
      valid: false,
      user: null,
      response: NextResponse.json({ error: "Authentication failed" }, { status: 401 }),
    }
  }
}
