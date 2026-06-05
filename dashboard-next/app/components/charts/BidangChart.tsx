"use client"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts"
import CustomTooltip from "../CustomTooltip"

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#3b82f6", "#10b981",
  "#f59e0b", "#ef4444", "#14b8a6", "#a855f7", "#f97316",
]

interface Props {
  data: { name: string; value: number }[]
}

export default function BidangChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis
          type="category"
          dataKey="name"
          width={160}
          tick={{ fontSize: 11 }}
          tickFormatter={(v) => (v.length > 22 ? v.slice(0, 22) + "…" : v)}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Jumlah">
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
