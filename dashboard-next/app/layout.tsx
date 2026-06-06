import type { Metadata } from "next"
import "./globals.css"
import Navbar from "./components/Navbar"
import BottomNav from "./components/BottomNav"

export const metadata: Metadata = {
  title: "Siswa Berprestasi 2026",
  description: "Dashboard & Pencarian BM25 · Data Instagram Siswa Berprestasi SMA/SMP Indonesia",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 pb-24 md:pb-6">
          {children}
        </main>
        <footer className="hidden md:block py-6 text-center text-xs" style={{ color: "var(--muted)" }}>
          Information Retrieval · Tugas 1 · BM25 (k₁=1.5, b=0.75) · Scraping Instagram 2026
        </footer>
        <BottomNav />
      </body>
    </html>
  )
}
