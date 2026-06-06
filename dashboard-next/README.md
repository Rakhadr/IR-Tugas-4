# Dashboard Siswa Berprestasi 2026

Dashboard visualisasi dan mesin pencari berbasis **BM25 (Okapi BM25)** untuk data scraping Instagram bertema siswa berprestasi SMA/SMP Indonesia tahun 2026.

Dibuat sebagai Tugas 1 mata kuliah **Information Retrieval**.

---

## Fitur

### Dashboard Statistik
- KPI cards: total scrape, postingan relevan, kelas XI, sekolah, provinsi
- Grafik bidang prestasi, tingkat kompetisi, tren postingan per bulan
- Top 12 provinsi, heatmap bidang × tingkat, rata-rata engagement per bidang
- Top 15 hashtag sumber

### Pencarian BM25
- Ranked retrieval menggunakan algoritma **Okapi BM25** (k₁=1.5, b=0.75)
- Tokenisasi dengan stopword removal (Bahasa Indonesia + Inggris)
- Highlight token hasil query pada teks
- Fallback ke pencarian teks biasa
- Pagination hasil (15 per halaman)
- Debug info: jumlah dokumen, term unik, avgdl, token query

---

## Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | Tailwind CSS v4, Recharts, Lucide Icons |
| Search | BM25 custom — dijalankan di server (Next.js API Route) |
| Data | `public/data.json` — static, di-bundle saat build |
| Deploy | Vercel |

Tidak ada database eksternal. Semua data tersimpan di `public/data.json` dan index BM25 dibangun di memori server saat pertama kali diakses (singleton cache).

---

## Struktur Proyek

```
app/
├── api/search/route.ts     # API endpoint BM25 (POST /api/search)
├── components/
│   ├── Navbar.tsx
│   ├── BottomNav.tsx       # Mobile bottom navigation
│   ├── StatCard.tsx
│   ├── ChartCard.tsx
│   ├── StatsPage.tsx       # Halaman dashboard
│   ├── SearchPage.tsx      # Halaman pencarian
│   └── charts/             # Komponen chart individual
├── lib/
│   ├── bm25.ts             # Implementasi BM25Index + tokenizer
│   └── data.ts             # Loader data.json
├── types.ts                # Type Row, Stats, DataFile
├── page.tsx                # Route /
└── search/page.tsx         # Route /search
public/
└── data.json               # Dataset (914 postingan relevan)
```

---

## Cara Jalankan

### Development

```bash
# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm run start
```

---

## Deploy ke Vercel

1. Push repo ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Set **Root Directory** ke `dashboard-next`
4. Klik **Deploy**

Tidak ada environment variable yang dibutuhkan.

---

## Dataset

Data di-scrape dari Instagram menggunakan hashtag terkait siswa berprestasi SMA/SMP Indonesia 2026.

| Field | Deskripsi |
|---|---|
| `nama_siswa` | Nama siswa (hasil ekstraksi dari caption) |
| `sekolah` | Nama sekolah |
| `provinsi` | Provinsi asal |
| `tingkat` | Tingkat kompetisi (Nasional / Provinsi / Kota / Internasional) |
| `bidang` | Bidang prestasi (Akademik, Olahraga, Seni, dll) |
| `juara` | Informasi juara/peringkat |
| `kelas_xi` | Flag deteksi kelas XI |
| `likes` / `komentar` | Engagement metrics |

---

## Algoritma BM25

$$\text{score}(D, Q) = \sum_{t \in Q} \text{IDF}(t) \cdot \frac{f(t,D) \cdot (k_1 + 1)}{f(t,D) + k_1 \cdot \left(1 - b + b \cdot \frac{|D|}{\text{avgdl}}\right)}$$

Parameter yang digunakan:
- **k₁ = 1.5** — saturasi frekuensi term
- **b = 0.75** — normalisasi panjang dokumen

Field yang diindeks per dokumen: `caption`, `nama_siswa`, `sekolah`, `juara`, `bidang`, `tingkat`, `provinsi`.
