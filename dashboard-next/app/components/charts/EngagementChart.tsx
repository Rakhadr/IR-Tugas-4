"use client"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import CustomTooltip from "../CustomTooltip"

interface Props {
  data: { name: string; likes: number; komentar: number }[]
}

export default function EngagementChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10 }}
          angle={-30}
          textAnchor="end"
          interval={0}
          tickFormatter={(v) => (v.length > 16 ? v.slice(0, 16) + "…" : v)}
        />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip formatter={(v) => v.toFixed(1)} />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span style={{ color: "#8892a4", fontSize: 12 }}>{v}</span>}
        />
        <Bar dataKey="likes" name="Avg Likes" fill="#6366f1" radius={[4, 4, 0, 0]} />
        <Bar dataKey="komentar" name="Avg Komentar" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
