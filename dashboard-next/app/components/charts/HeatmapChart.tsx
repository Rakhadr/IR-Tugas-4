"use client"

interface Cell {
  bidang: string
  tingkat: string
  value: number
}

interface Props {
  data: Cell[]
  bidangs: string[]
  tingkats: string[]
}

export default function HeatmapChart({ data, bidangs, tingkats }: Props) {
  const max = Math.max(...data.map((d) => d.value), 1)

  const cellMap = new Map<string, number>()
  data.forEach((d) => cellMap.set(`${d.bidang}|${d.tingkat}`, d.value))

  return (
    <div className="overflow-x-auto">
      <table className="text-xs border-collapse w-full" style={{ minWidth: 420 }}>
        <thead>
          <tr>
            <th
              className="px-3 py-2 text-left font-medium"
              style={{ color: "var(--muted)", width: 160, minWidth: 140 }}
            >
              Bidang \ Tingkat
            </th>
            {tingkats.map((t) => (
              <th key={t} className="px-2 py-2 text-center font-medium" style={{ color: "var(--muted)" }}>
                {t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bidangs.map((b) => (
            <tr key={b}>
              <td
                className="px-3 py-2 font-medium truncate"
                style={{ color: "var(--text)", maxWidth: 160 }}
                title={b}
              >
                {b.length > 22 ? b.slice(0, 22) + "…" : b}
              </td>
              {tingkats.map((t) => {
                const v = cellMap.get(`${b}|${t}`) ?? 0
                const intensity = v / max
                return (
                  <td key={t} className="px-2 py-2 text-center">
                    <div
                      className="mx-auto rounded-lg flex items-center justify-center font-semibold transition-all"
                      style={{
                        width: 44,
                        height: 36,
                        background: v === 0
                          ? "var(--surface2)"
                          : `rgba(99,102,241,${0.12 + intensity * 0.88})`,
                        color: intensity > 0.5 ? "#fff" : "var(--muted)",
                        fontSize: 12,
                      }}
                      title={`${b} × ${t}: ${v}`}
                    >
                      {v || "·"}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
