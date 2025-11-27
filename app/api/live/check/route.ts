import { NextResponse } from "next/server"
import { checkAndUpdateLiveStatus } from "@/lib/live-detector"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const result = await checkAndUpdateLiveStatus()
    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Live check error:", error)
    return NextResponse.json({ error: "Failed to check live status" }, { status: 500 })
  }
}
