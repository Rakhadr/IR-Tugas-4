// BM25 (Okapi BM25) implementation
// k1 = 1.5 : term frequency saturation — semakin tinggi, semakin berpengaruh frekuensi term
// b  = 0.75 : length normalization — 0 = tidak dinormalisasi, 1 = full normalisasi panjang dokumen

const k1 = 1.5
const b = 0.75

const STOPWORDS = new Set([
  "yang", "dan", "di", "ini", "itu", "atau", "juga", "dengan", "untuk",
  "dari", "ke", "pada", "ada", "tidak", "dalam", "adalah", "sebagai",
  "akan", "sudah", "lebih", "bisa", "saya", "kami", "kita", "mereka",
  "dia", "ia", "para", "atas", "oleh", "karena", "saat", "masih",
  "telah", "atas", "oleh", "karena", "saat", "masih", "telah", "selamat",
  "kepada", "ananda", "dalam", "berhasil", "meraih", "semoga", "terus",
  "bangga", "atas", "capaian", "prestasi", "sekolah", "siswa", "pelajar",
  "tingkat", "lomba", "kompetisi", "tahun", "nama", "hasil", "semangat",
  "the", "a", "an", "of", "in", "to", "and", "for", "is", "at",
])

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
}

export interface BM25Doc {
  id: string
  tokens: string[]
}

export interface SearchResult {
  id: string
  score: number
}

export class BM25Index {
  private docs: BM25Doc[]
  private df: Map<string, number>       // document frequency per term
  private idf: Map<string, number>      // precomputed IDF per term
  private docNorms: Map<string, number> // precomputed TF-IDF L2 norm per doc
  private avgdl: number
  private N: number

  constructor(docs: BM25Doc[]) {
    this.docs = docs
    this.N = docs.length
    this.df = new Map()
    this.idf = new Map()
    this.docNorms = new Map()

    // hitung document frequency
    for (const doc of docs) {
      const seen = new Set<string>()
      for (const t of doc.tokens) {
        if (!seen.has(t)) {
          this.df.set(t, (this.df.get(t) ?? 0) + 1)
          seen.add(t)
        }
      }
    }

    // precompute IDF: log((N - df + 0.5) / (df + 0.5) + 1)  [Robertson–Sparck Jones]
    for (const [term, df] of this.df) {
      this.idf.set(term, Math.log((this.N - df + 0.5) / (df + 0.5) + 1))
    }

    // average document length
    const total = docs.reduce((sum, d) => sum + d.tokens.length, 0)
    this.avgdl = this.N > 0 ? total / this.N : 1

    // precompute TF-IDF L2 norm per doc (untuk cosine similarity)
    for (const doc of docs) {
      const tf = new Map<string, number>()
      for (const t of doc.tokens) tf.set(t, (tf.get(t) ?? 0) + 1)
      let norm = 0
      for (const [t, count] of tf) {
        const w = (count / doc.tokens.length) * (this.idf.get(t) ?? 0)
        norm += w * w
      }
      this.docNorms.set(doc.id, Math.sqrt(norm))
    }
  }

  search(query: string, topK = 50): SearchResult[] {
    const qTokens = tokenize(query)
    if (qTokens.length === 0) return []

    const scores = new Map<string, number>()

    for (const doc of this.docs) {
      const dl = doc.tokens.length
      if (dl === 0) continue

      // term frequency dalam dokumen ini
      const tf = new Map<string, number>()
      for (const t of doc.tokens) tf.set(t, (tf.get(t) ?? 0) + 1)

      let score = 0
      for (const qt of qTokens) {
        const idf = this.idf.get(qt) ?? 0
        if (idf === 0) continue
        const f = tf.get(qt) ?? 0
        // BM25 core formula
        score += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * (dl / this.avgdl)))
      }

      if (score > 0) scores.set(doc.id, score)
    }

    const ranked = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK)
      .map(([id]) => id)

    // Hitung TF-IDF cosine similarity untuk hasil BM25
    const cosines = this.cosineScores(query, ranked)

    return ranked.map((id) => ({
      id,
      score: Math.round((cosines.get(id) ?? 0) * 1000) / 1000,
    }))
  }

  // TF-IDF cosine similarity (0–1) untuk daftar doc ID tertentu
  cosineScores(query: string, ids: string[]): Map<string, number> {
    const qTokens = tokenize(query)
    if (qTokens.length === 0) return new Map()

    // Query: binary TF × IDF
    const qWeights = new Map<string, number>()
    let qNorm = 0
    for (const t of new Set(qTokens)) {
      const idf = this.idf.get(t) ?? 0
      qWeights.set(t, idf)
      qNorm += idf * idf
    }
    qNorm = Math.sqrt(qNorm)
    if (qNorm === 0) return new Map()

    const idSet = new Set(ids)
    const result = new Map<string, number>()

    for (const doc of this.docs) {
      if (!idSet.has(doc.id)) continue
      const tf = new Map<string, number>()
      for (const t of doc.tokens) tf.set(t, (tf.get(t) ?? 0) + 1)

      let dot = 0
      for (const [t, qw] of qWeights) {
        const count = tf.get(t) ?? 0
        if (count === 0) continue
        dot += qw * ((count / doc.tokens.length) * (this.idf.get(t) ?? 0))
      }

      const dNorm = this.docNorms.get(doc.id) ?? 0
      result.set(doc.id, dNorm === 0 ? 0 : dot / (qNorm * dNorm))
    }

    return result
  }

  stats() {
    return {
      docs: this.N,
      terms: this.df.size,
      avgdl: Math.round(this.avgdl * 10) / 10,
    }
  }
}

// Build index dari rows data
export function buildIndex(rows: { id: string; caption: string | null; nama_siswa: string | null; sekolah: string | null; juara: string | null; bidang: string | null; provinsi: string | null; hashtag: string | null }[]): BM25Index {
  const docs: BM25Doc[] = rows.map((r) => {
    const text = [
      r.caption ?? "",
      r.nama_siswa ?? "",
      r.sekolah ?? "",
      r.juara ?? "",
      r.bidang ?? "",
      r.provinsi ?? "",
      r.hashtag ?? "",
    ].join(" ")
    return { id: r.id, tokens: tokenize(text) }
  })
  return new BM25Index(docs)
}
