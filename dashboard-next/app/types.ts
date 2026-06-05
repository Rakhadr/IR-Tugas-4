export interface Row {
  id: string
  url: string | null
  tanggal: string | null
  bulan: string | null
  username: string | null
  akun: string | null
  likes: number
  komentar: number
  hashtag: string | null
  caption: string | null
  nama_siswa: string | null
  sekolah: string | null
  provinsi: string | null
  kelas_xi: boolean
  tingkat: string | null
  bidang: string | null
  juara: string | null
}

export interface Stats {
  total_scrape: number
  total_relevan: number
  kelas_xi: number
  nama_detected: number
  sekolah_detected: number
  provinsi_detected: number
}

export interface DataFile {
  stats: Stats
  rows: Row[]
}
