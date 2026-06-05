"use client"

interface TooltipProps {
  active?: boolean
  payload?: { name: string; value: number; color?: string; fill?: string }[]
  label?: string
  formatter?: (v: number) => string
}

export default function CustomTooltip({ active, payload, label, formatter }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs shadow-lg"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        color: "var(--text)",
        minWidth: 120,
      }}
    >
      {label && <p className="font-semibold mb-1 truncate max-w-[180px]">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color ?? p.fill ?? "#4f46e5" }} />
          <span style={{ color: "var(--muted)" }}>{p.name}:</span>
          <span className="font-semibold">{formatter ? formatter(p.value) : p.value.toLocaleString("id-ID")}</span>
        </div>
      ))}
    </div>
  )
}
