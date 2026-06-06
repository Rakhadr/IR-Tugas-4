"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart2, Search } from "lucide-react"

export default function BottomNav() {
  const path = usePathname()
  const isSearch = path === "/search"
  const isDashboard = path === "/"

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-stretch"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.08)",
        height: 64,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Dashboard tab */}
      <Link
        href="/"
        className="flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors"
        style={{ color: isDashboard ? "var(--accent)" : "var(--muted)" }}
      >
        <BarChart2 size={22} strokeWidth={isDashboard ? 2.5 : 1.8} />
        Dashboard
      </Link>

      {/* Search tab */}
      <Link
        href="/search"
        className="flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors active:opacity-60"
        style={{ color: isSearch ? "var(--accent)" : "var(--muted)" }}
      >
        <Search size={22} strokeWidth={isSearch ? 2.5 : 1.8} />
        Pencarian
      </Link>
    </nav>
  )
}
