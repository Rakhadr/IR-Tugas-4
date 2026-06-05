"use client"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts"
import CustomTooltip from "../CustomTooltip"

interface Props {
  data: { name: string; value: number }[]
}

export default function ProvinsiChart({ data }: Props) {
  const max = data[0]?.value ?? 1
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(16,185,129,0.06)" }} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Postingan">
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={`rgba(16,185,129,${0.35 + 0.65 * (entry.value / max)})`}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
