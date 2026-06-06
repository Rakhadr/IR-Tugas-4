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
      className="rounded-2xl p-4 md:p-5 flex flex-col gap-2 md:gap-3"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] md:text-xs font-medium uppercase tracking-widest" style={{ color: "var(--muted)" }}>
          {label}
        </span>
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={13} style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
        </p>
        {sub && <p className="text-[11px] md:text-xs mt-0.5" style={{ color: "var(--muted)" }}>{sub}</p>}
      </div>
      <div className="h-0.5 rounded-full w-8 md:w-10" style={{ background: color }} />
    </div>
  )
}
