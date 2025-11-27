import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const term = searchParams.get("term")

  if (!term) {
    return NextResponse.json({ error: "Search term required" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=20`,
    )

    if (!response.ok) {
      throw new Error("iTunes API request failed")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] iTunes search error:", error)
    return NextResponse.json({ error: "Failed to search iTunes" }, { status: 500 })
  }
}
