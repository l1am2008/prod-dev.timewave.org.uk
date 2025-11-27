import { type NextRequest, NextResponse } from "next/server"
import { checkAndUpdateLiveStatus } from "@/lib/live-detector"

export const dynamic = "force-dynamic"

// This endpoint can be called by a cron job (e.g., Vercel Cron)
export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await checkAndUpdateLiveStatus()
    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Cron live check error:", error)
    return NextResponse.json({ error: "Failed to check live status" }, { status: 500 })
  }
}
