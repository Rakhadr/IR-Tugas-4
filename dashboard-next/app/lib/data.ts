import type { DataFile } from "../types"
import rawData from "../../public/data.json"

export function getData(): DataFile {
  return rawData as DataFile
}

export function countBy<T>(
  arr: T[],
  key: (item: T) => string | null | undefined
): { name: string; value: number }[] {
  const map = new Map<string, number>()
  for (const item of arr) {
    const k = key(item) ?? "Tidak Diketahui"
    map.set(k, (map.get(k) ?? 0) + 1)
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function avgBy<T>(
  arr: T[],
  groupKey: (item: T) => string | null | undefined,
  valueKey: (item: T) => number
): { name: string; value: number }[] {
  const map = new Map<string, number[]>()
  for (const item of arr) {
    const k = groupKey(item) ?? "Tidak Diketahui"
    if (!map.has(k)) map.set(k, [])
    map.get(k)!.push(valueKey(item))
  }
  return Array.from(map.entries())
    .map(([name, vals]) => ({
      name,
      value: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
    }))
    .filter((d) => d.name !== "Tidak Diketahui")
    .sort((a, b) => b.value - a.value)
}
