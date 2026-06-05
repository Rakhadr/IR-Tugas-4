"use client"

import { useMemo } from "react"
import { Database, Users, School, MapPin, Trophy } from "lucide-react"
import type { Row, Stats } from "../types"
import StatCard from "./StatCard"
import ChartCard from "./ChartCard"
import BidangChart from "./charts/BidangChart"
import TingkatChart from "./charts/TingkatChart"
import TrendChart from "./charts/TrendChart"
import ProvinsiChart from "./charts/ProvinsiChart"
import EngagementChart from "./charts/EngagementChart"
import HashtagChart from "./charts/HashtagChart"
import HeatmapChart from "./charts/HeatmapChart"

function countBy(arr: Row[], key: (r: Row) => string | null | undefined) {
  const map = new Map<string, number>()
  for (const r of arr) {
    const k = key(r) ?? "Tidak Diketahui"
    map.set(k, (map.get(k) ?? 0) + 1)
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

function avgEngagement(arr: Row[]) {
  const map = new Map<string, { likes: number[]; kom: number[] }>()
  for (const r of arr) {
    if (!r.bidang) continue
    if (!map.has(r.bidang)) map.set(r.bidang, { likes: [], kom: [] })
    map.get(r.bidang)!.likes.push(r.likes)
    map.get(r.bidang)!.kom.push(r.komentar)
  }
  return Array.from(map.entries())
    .map(([name, { likes, kom }]) => ({
      name,
      likes: Math.round((likes.reduce((a, b) => a + b, 0) / likes.length) * 10) / 10,
      komentar: Math.round((kom.reduce((a, b) => a + b, 0) / kom.length) * 10) / 10,
    }))
    .sort((a, b) => b.likes - a.likes)
}

interface Props { rows: Row[]; stats: Stats }

export default function StatsPage({ rows, stats }: Props) {
  const bidangData  = useMemo(() => countBy(rows, (r) => r.bidang).filter((d) => d.name !== "Tidak Diketahui"), [rows])
  const tingkatData = useMemo(() => countBy(rows, (r) => r.tingkat).filter((d) => d.name !== "Tidak Diketahui"), [rows])
  const provData    = useMemo(() => countBy(rows, (r) => r.provinsi).filter((d) => d.name !== "Tidak Diketahui").slice(0, 12), [rows])
  const trendData   = useMemo(() =>
    countBy(rows.filter((r) => r.bulan), (r) => r.bulan)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((d) => ({ name: d.name, value: d.value })),
  [rows])
  const engData     = useMemo(() => avgEngagement(rows), [rows])
  const hashData    = useMemo(() => countBy(rows, (r) => r.hashtag).slice(0, 15), [rows])

  const heatmapBidangs  = useMemo(() => Array.from(new Set(rows.map((r) => r.bidang).filter(Boolean) as string[])), [rows])
  const heatmapTingkats = useMemo(() => Array.from(new Set(rows.map((r) => r.tingkat).filter(Boolean) as string[])), [rows])
  const heatmapData     = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of rows) {
      if (!r.bidang || !r.tingkat) continue
      const k = `${r.bidang}|${r.tingkat}`
      map.set(k, (map.get(k) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([k, value]) => {
      const [bidang, tingkat] = k.split("|")
      return { bidang, tingkat, value }
    })
  }, [rows])

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>Dashboard Statistik</h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Ringkasan data scraping Instagram · hashtag siswa berprestasi SMA/SMP Indonesia 2026
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard label="Total Di-scrape"   value={stats.total_scrape}      icon={Database} color="#4f46e5" />
        <StatCard label="Postingan Relevan" value={stats.total_relevan}      sub="filter prestasi" icon={Trophy}  color="#059669" />
        <StatCard label="Kelas XI"          value={stats.kelas_xi}           sub="terdeteksi"      icon={Users}   color="#2563eb" />
        <StatCard label="Sekolah"           value={stats.sekolah_detected}   sub="teridentifikasi" icon={School}  color="#dc2626" />
        <StatCard label="Provinsi"          value={stats.provinsi_detected}  sub="memiliki lokasi" icon={MapPin}  color="#db2777" />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Bidang Prestasi" subtitle={`${bidangData.length} kategori`} className="lg:col-span-2">
          <BidangChart data={bidangData} />
        </ChartCard>
        <ChartCard title="Tingkat Kompetisi" subtitle="Distribusi level">
          <TingkatChart data={tingkatData} />
        </ChartCard>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <ChartCard title="Tren Postingan per Bulan" subtitle="Volume waktu" className="lg:col-span-3">
          <TrendChart data={trendData} />
        </ChartCard>
        <ChartCard title="Top 12 Provinsi" subtitle="Berdasarkan jumlah postingan" className="lg:col-span-2">
          <ProvinsiChart data={provData} />
        </ChartCard>
      </div>

      {/* Row 3: heatmap */}
      <ChartCard title="Heatmap Bidang × Tingkat Kompetisi" subtitle="Jumlah postingan per kombinasi">
        <HeatmapChart data={heatmapData} bidangs={heatmapBidangs} tingkats={heatmapTingkats} />
      </ChartCard>

      {/* Row 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Rata-rata Engagement per Bidang" subtitle="Avg likes & komentar">
          <EngagementChart data={engData} />
        </ChartCard>
        <ChartCard title="Top 15 Hashtag Sumber" subtitle="Jumlah postingan per hashtag">
          <HashtagChart data={hashData} />
        </ChartCard>
      </div>
    </div>
  )
}
