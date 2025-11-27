import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const JWT_EXPIRES_IN = "7d"

export interface UserPayload {
  id: number
  email: string
  username: string
  role: "user" | "staff" | "admin" | "super_admin"
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload
  } catch {
    return null
  }
}

export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex")
}
