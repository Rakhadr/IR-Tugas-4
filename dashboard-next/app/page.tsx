import { getData } from "./lib/data"
import StatsPage from "./components/StatsPage"

export default function Home() {
  const { stats, rows } = getData()
  return <StatsPage rows={rows} stats={stats} />
}
