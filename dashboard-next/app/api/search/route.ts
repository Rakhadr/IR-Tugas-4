import { NextRequest, NextResponse } from "next/server"
import { getData } from "@/app/lib/data"
import { buildIndex, tokenize } from "@/app/lib/bm25"

// Index dibangun sekali dan di-cache di memory server (singleton)
let cachedIndex: ReturnType<typeof buildIndex> | null = null

function getIndex() {
  if (!cachedIndex) {
    const { rows } = getData()
    cachedIndex = buildIndex(rows)
  }
  return cachedIndex
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const query: string = body.query ?? ""
  const topK: number = body.topK ?? 50

  if (!query.trim()) {
    return NextResponse.json({ results: [], stats: null, tokens: [] })
  }

  const index = getIndex()
  const results = index.search(query, topK)
  const stats = index.stats()
  const tokens = tokenize(query)

  return NextResponse.json({ results, stats, tokens })
}

// IDF inspector — debug endpoint
export async function GET(req: NextRequest) {
  const term = new URL(req.url).searchParams.get("term") ?? ""
  if (!term) return NextResponse.json({ error: "?term= required" }, { status: 400 })

  const index = getIndex()
  const results = index.search(term, 10)
  const stats = index.stats()

  return NextResponse.json({ term, top10: results, indexStats: stats })
}
