"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Search, Zap, X, ExternalLink, Info, ChevronUp, ChevronDown } from "lucide-react"
import type { Row } from "../types"

// ── highlight matching tokens ─────────────────────────────────────────────────
function Highlight({ text, tokens }: { text: string | null; tokens: string[] }) {
  if (!text) return <span style={{ color: "var(--muted)" }}>—</span>
  if (tokens.length === 0) return <>{text}</>
  const regex = new RegExp(
    `(${tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi"
  )
  const parts = text.split(regex)
  return (
    <>
      {parts.map((p, i) =>
        regex.test(p) ? (
          <mark key={i} style={{ background: "#fde68a", color: "#92400e", borderRadius: 2, padding: "0 2px" }}>
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  )
}

// ── score bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = max > 0 ? (score / max) * 100 : 0
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface2)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#4f46e5,#7c3aed)" }} />
      </div>
      <span className="text-[11px] font-mono font-semibold" style={{ color: "#4f46e5" }}>
        {score.toFixed(3)}
      </span>
    </div>
  )
}

const BADGE: Record<string, string> = {
  Nasional: "#4f46e5",
  Internasional: "#db2777",
  Provinsi: "#2563eb",
  "Kota/Kabupaten": "#059669",
}

interface BM25Result { id: string; score: number }
interface BM25Response {
  results: BM25Result[]
  stats: { docs: number; terms: number; avgdl: number } | null
  tokens: string[]
}

const EXAMPLE_QUERIES = [
  "juara matematika nasional",
  "O2SN renang provinsi",
  "debat bahasa inggris",
  "FLS2N seni tari",
  "karya ilmiah remaja",
  "olimpiade fisika kota",
]

const TINGKAT_COLORS: Record<string, { bg: string; text: string }> = {
  Nasional:        { bg: "rgba(79,70,229,0.1)",  text: "#4f46e5" },
  Internasional:   { bg: "rgba(219,39,119,0.1)", text: "#db2777" },
  Provinsi:        { bg: "rgba(37,99,235,0.1)",  text: "#2563eb" },
  "Kota/Kabupaten":{ bg: "rgba(5,150,105,0.1)",  text: "#059669" },
}

interface Props { rows: Row[] }

export default function SearchPage({ rows }: Props) {
  const [mode, setMode] = useState<"bm25" | "text">("bm25")
  const [query, setQuery] = useState("")
  const [bm25Data, setBm25Data] = useState<BM25Response | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const PER_PAGE = 15

  // rowMap untuk lookup cepat
  const rowMap = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows])

  // ── BM25 fetch ──
  useEffect(() => {
    if (mode !== "bm25" || !query.trim()) {
      setBm25Data(null)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, topK: 200 }),
        })
        setBm25Data(await res.json())
      } finally {
        setLoading(false)
        setPage(1)
      }
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, mode])

  // ── hasil ──
  const results = useMemo<(Row & { _score?: number })[]>(() => {
    if (!query.trim()) return []

    if (mode === "bm25") {
      if (!bm25Data?.results.length) return []
      return bm25Data.results
        .map((r) => {
          const row = rowMap.get(r.id)
          return row ? { ...row, _score: r.score } : null
        })
        .filter(Boolean) as (Row & { _score: number })[]
    }

    // simple text search
    const q = query.toLowerCase()
    return rows.filter(
      (r) =>
        r.caption?.toLowerCase().includes(q) ||
        r.nama_siswa?.toLowerCase().includes(q) ||
        r.sekolah?.toLowerCase().includes(q) ||
        r.juara?.toLowerCase().includes(q) ||
        r.bidang?.toLowerCase().includes(q) ||
        r.provinsi?.toLowerCase().includes(q)
    )
  }, [query, mode, bm25Data, rows, rowMap])

  const tokens  = mode === "bm25" ? (bm25Data?.tokens ?? []) : []
  const maxScore = results.length > 0 ? Math.max(...results.map((r) => r._score ?? 0), 1) : 1

  const paged      = results.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(results.length / PER_PAGE)

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>Pencarian</h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Cari postingan menggunakan BM25 (ranked retrieval) atau pencarian teks biasa
        </p>
      </div>

      {/* Search box */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
      >
        {/* Mode toggle */}
        <div className="flex items-center gap-3">
          <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>Mode pencarian:</p>
          <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            {(["bm25", "text"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setQuery(""); setBm25Data(null); setPage(1) }}
                className="px-4 py-2 text-xs flex items-center gap-1.5 transition-all font-medium"
                style={{
                  background: mode === m ? (m === "bm25" ? "#4f46e5" : "var(--surface2)") : "transparent",
                  color: mode === m ? (m === "bm25" ? "#fff" : "var(--text)") : "var(--muted)",
                }}
              >
                {m === "bm25" ? <><Zap size={12} /> BM25 Ranking</> : <><Search size={12} /> Teks Biasa</>}
              </button>
            ))}
          </div>
          {mode === "bm25" && (
            <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(79,70,229,0.08)", color: "#4f46e5" }}>
              k₁=1.5 · b=0.75
            </span>
          )}
        </div>

        {/* Input */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            placeholder={mode === "bm25" ? "Contoh: juara matematika nasional, O2SN renang…" : "Cari nama, sekolah, caption…"}
            autoFocus
            className="w-full rounded-xl pl-11 pr-10 py-3 text-sm outline-none transition-all"
            style={{
              background: "var(--surface2)",
              border: `1.5px solid ${mode === "bm25" && query ? "#4f46e5" : "var(--border)"}`,
              color: "var(--text)",
            }}
          />
          {query && (
            <button onClick={() => { setQuery(""); setBm25Data(null) }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors hover:bg-gray-100">
              <X size={14} style={{ color: "var(--muted)" }} />
            </button>
          )}
        </div>

        {/* Example queries */}
        {!query && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs" style={{ color: "var(--muted)" }}>Coba:</span>
            {EXAMPLE_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => setQuery(q)}
                className="text-xs px-3 py-1 rounded-full transition-colors"
                style={{ background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* BM25 debug info */}
        {mode === "bm25" && bm25Data?.stats && results.length > 0 && (
          <div
            className="flex flex-wrap items-center gap-3 px-4 py-2.5 rounded-xl text-xs"
            style={{ background: "rgba(79,70,229,0.05)", border: "1px solid rgba(79,70,229,0.15)" }}
          >
            <Info size={13} style={{ color: "#4f46e5" }} />
            <span style={{ color: "#4f46e5", fontWeight: 600 }}>BM25 Index</span>
            <span style={{ color: "var(--muted)" }}>
              {bm25Data.stats.docs.toLocaleString("id-ID")} dokumen ·{" "}
              {bm25Data.stats.terms.toLocaleString("id-ID")} term unik ·{" "}
              avgdl {bm25Data.stats.avgdl} token/dok
            </span>
            <span style={{ color: "var(--muted)" }}>Tokens:</span>
            {bm25Data.tokens.map((t) => (
              <code key={t} className="px-1.5 py-0.5 rounded text-[11px]" style={{ background: "rgba(79,70,229,0.12)", color: "#4f46e5" }}>
                {t}
              </code>
            ))}
            <span className="ml-auto font-medium" style={{ color: "#4f46e5" }}>
              {results.length} hasil · top score {results[0]?._score?.toFixed(3)}
            </span>
          </div>
        )}
      </div>

      {/* Results */}
      {query && (
        <div className="space-y-3">
          {/* result count header */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
              {loading ? (
                <span style={{ color: "var(--muted)" }}>Menghitung…</span>
              ) : (
                <>
                  <span style={{ color: "#4f46e5" }}>{results.length}</span> hasil ditemukan
                  {mode === "bm25" && <span style={{ color: "var(--muted)" }}> · diurutkan by relevance</span>}
                </>
              )}
            </p>
            {totalPages > 1 && (
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                Halaman {page} / {totalPages}
              </span>
            )}
          </div>

          {/* result cards */}
          {paged.map((r, i) => {
            const rank = (page - 1) * PER_PAGE + i + 1
            const isExpanded = expandedId === r.id
            const tingkatStyle = TINGKAT_COLORS[r.tingkat ?? ""] ?? { bg: "rgba(107,114,128,0.1)", text: "#6b7280" }

            return (
              <div
                key={r.id}
                className="rounded-2xl transition-all"
                style={{
                  background: "var(--surface)",
                  border: `1px solid ${isExpanded ? "#4f46e5" : "var(--border)"}`,
                  boxShadow: isExpanded ? "0 0 0 3px rgba(79,70,229,0.08)" : "0 1px 4px rgba(0,0,0,0.05)",
                }}
              >
                {/* card header */}
                <div
                  className="flex items-start gap-4 p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                >
                  {/* rank badge */}
                  <div
                    className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                    style={{
                      background: rank <= 3 ? "#4f46e5" : "var(--surface2)",
                      color: rank <= 3 ? "#fff" : "var(--muted)",
                    }}
                  >
                    {rank}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* nama + sekolah */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                        <Highlight text={r.nama_siswa ?? r.akun ?? "Tidak diketahui"} tokens={tokens} />
                      </span>
                      {r.sekolah && (
                        <span className="text-xs" style={{ color: "var(--muted)" }}>
                          · <Highlight text={r.sekolah} tokens={tokens} />
                        </span>
                      )}
                      {r.provinsi && (
                        <span className="text-xs" style={{ color: "var(--muted)" }}>· {r.provinsi}</span>
                      )}
                    </div>

                    {/* badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {r.tingkat && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: tingkatStyle.bg, color: tingkatStyle.text }}>
                          {r.tingkat}
                        </span>
                      )}
                      {r.bidang && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(79,70,229,0.08)", color: "#4f46e5" }}>
                          {r.bidang}
                        </span>
                      )}
                      {r.kelas_xi && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(5,150,105,0.1)", color: "#059669" }}>
                          Kelas XI
                        </span>
                      )}
                      {r.tanggal && (
                        <span className="text-[11px]" style={{ color: "var(--muted)" }}>{r.tanggal.slice(0, 10)}</span>
                      )}
                    </div>

                    {/* juara */}
                    {r.juara && (
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        🏅 <Highlight text={r.juara} tokens={tokens} />
                      </p>
                    )}
                  </div>

                  {/* score + expand */}
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {r._score !== undefined && <ScoreBar score={r._score} max={maxScore} />}
                    <div style={{ color: "var(--muted)" }}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>
                </div>

                {/* expanded: caption */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
                    <div className="mt-3">
                      <p className="text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>Caption:</p>
                      <p className="text-xs leading-relaxed rounded-xl p-3" style={{ background: "var(--surface2)", color: "var(--text)", whiteSpace: "pre-wrap" }}>
                        <Highlight text={r.caption} tokens={tokens} />
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs" style={{ color: "var(--muted)" }}>
                      <span>
                        👍 {r.likes.toLocaleString("id-ID")} · 💬 {r.komentar} ·{" "}
                        <a href={`https://instagram.com/${r.username}`} target="_blank" rel="noopener noreferrer" style={{ color: "#4f46e5" }}>
                          @{r.username}
                        </a>
                      </span>
                      {r.url && (
                        <a href={r.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors"
                          style={{ background: "rgba(79,70,229,0.08)", color: "#4f46e5" }}>
                          <ExternalLink size={12} /> Buka di Instagram
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {/* empty state */}
          {!loading && results.length === 0 && (
            <div className="rounded-2xl py-16 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p className="text-3xl mb-3">🔍</p>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>Tidak ada hasil untuk "{query}"</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Coba kata kunci lain atau gunakan mode Teks Biasa
              </p>
            </div>
          )}

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40 transition-colors"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}>
                ← Sebelumnya
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  const p = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className="w-9 h-9 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: p === page ? "#4f46e5" : "var(--surface)",
                        color: p === page ? "#fff" : "var(--muted)",
                        border: `1px solid ${p === page ? "#4f46e5" : "var(--border)"}`,
                      }}>
                      {p}
                    </button>
                  )
                })}
              </div>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40 transition-colors"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}>
                Berikutnya →
              </button>
            </div>
          )}
        </div>
      )}

      {/* empty/landing state */}
      {!query && (
        <div className="rounded-2xl py-16 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(79,70,229,0.1)" }}>
            <Zap size={24} style={{ color: "#4f46e5" }} />
          </div>
          <p className="text-base font-semibold" style={{ color: "var(--text)" }}>BM25 Ranked Retrieval</p>
          <p className="text-sm mt-1 max-w-sm mx-auto" style={{ color: "var(--muted)" }}>
            Ketik query di atas. Hasil akan diranking berdasarkan skor relevansi BM25 dari 914 dokumen.
          </p>
        </div>
      )}
    </div>
  )
}
