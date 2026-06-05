import { getData } from "../lib/data"
import SearchPage from "../components/SearchPage"

export default function Search() {
  const { rows } = getData()
  return <SearchPage rows={rows} />
}
