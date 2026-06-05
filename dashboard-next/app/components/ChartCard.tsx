"use client"
import { ReactNode } from "react"

interface Props {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  action?: ReactNode
}

export default function ChartCard({ title, subtitle, children, className = "", action }: Props) {
  return (
    <div
      className={`rounded-2xl p-5 flex flex-col gap-4 ${className}`}
      style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>{title}</h3>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}
