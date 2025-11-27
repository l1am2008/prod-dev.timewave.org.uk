import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { withAuth } from "@/lib/middleware"
import { sendNewsletterEmail } from "@/lib/email"

export async function GET(request: NextRequest) {
  const auth = await withAuth(["admin", "super_admin"])(request)
  if (auth instanceof NextResponse) return auth

  try {
    // Get all newsletter subscribers (both registered users and standalone subscribers)
    const userSubscribers: any[] = await query(
      "SELECT email FROM users WHERE newsletter_subscribed = TRUE AND is_verified = TRUE",
    )

    const standaloneSubscribers: any[] = await query("SELECT email FROM newsletter_subscribers WHERE is_active = TRUE")

    const allEmails = [...userSubscribers.map((u) => u.email), ...standaloneSubscribers.map((s) => s.email)]

    return NextResponse.json({
      count: allEmails.length,
      emails: allEmails,
    })
  } catch (error) {
    console.error("[v0] Failed to fetch newsletter subscribers:", error)
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await withAuth(["admin", "super_admin"])(request)
  if (auth instanceof NextResponse) return auth

  try {
    const { subject, content } = await request.json()

    if (!subject || !content) {
      return NextResponse.json({ error: "Subject and content are required" }, { status: 400 })
    }

    // Get all subscribers
    const userSubscribers: any[] = await query(
      "SELECT email FROM users WHERE newsletter_subscribed = TRUE AND is_verified = TRUE",
    )

    const standaloneSubscribers: any[] = await query("SELECT email FROM newsletter_subscribers WHERE is_active = TRUE")

    const allEmails = [...userSubscribers.map((u) => u.email), ...standaloneSubscribers.map((s) => s.email)]

    if (allEmails.length === 0) {
      return NextResponse.json({ error: "No subscribers found" }, { status: 400 })
    }

    // Send newsletter (in batches of 50 to avoid rate limits)
    const batchSize = 50
    for (let i = 0; i < allEmails.length; i += batchSize) {
      const batch = allEmails.slice(i, i + batchSize)
      await sendNewsletterEmail(batch, subject, content)
    }

    return NextResponse.json({
      message: `Newsletter sent to ${allEmails.length} subscribers`,
    })
  } catch (error) {
    console.error("[v0] Failed to send newsletter:", error)
    return NextResponse.json({ error: "Failed to send newsletter" }, { status: 500 })
  }
}
