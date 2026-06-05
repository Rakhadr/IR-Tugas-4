"use client"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { PieLabelRenderProps } from "recharts"
import CustomTooltip from "../CustomTooltip"

const COLORS: Record<string, string> = {
  Nasional: "#6366f1",
  Internasional: "#ec4899",
  Provinsi: "#3b82f6",
  "Kota/Kabupaten": "#10b981",
  "Tidak Diketahui": "#4b5563",
}

interface Props {
  data: { name: string; value: number }[]
}

const RADIAN = Math.PI / 180
function renderLabel(props: PieLabelRenderProps) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props
  if (!percent || percent < 0.04) return null
  const r = (Number(innerRadius) + Number(outerRadius)) * 0.5 * 0.9 + (Number(innerRadius)) * 0.1
  const angle = Number(midAngle) * RADIAN
  const x = Number(cx) + r * Math.cos(-angle)
  const y = Number(cy) + r * Math.sin(-angle)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function TingkatChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          outerRadius={110}
          innerRadius={55}
          dataKey="value"
          nameKey="name"
          labelLine={false}
          label={renderLabel}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={COLORS[entry.name] ?? "#6b7280"} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span style={{ color: "#8892a4", fontSize: 12 }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
