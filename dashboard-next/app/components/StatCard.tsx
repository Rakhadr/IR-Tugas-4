"use client"
import { LucideIcon } from "lucide-react"

interface Props {
  label: string
  value: number | string
  sub?: string
  icon: LucideIcon
  color: string   // hex accent color
}

export default function StatCard({ label, value, sub, icon: Icon, color }: Props) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--muted)" }}>
          {label}
        </span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
        </p>
        {sub && <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{sub}</p>}
      </div>
      {/* accent underline */}
      <div className="h-0.5 rounded-full w-10" style={{ background: color }} />
    </div>
  )
}
