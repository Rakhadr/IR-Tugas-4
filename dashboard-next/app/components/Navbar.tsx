"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart2, Search, Trophy } from "lucide-react"

const LINKS = [
  { href: "/",       label: "Dashboard",  icon: BarChart2 },
  { href: "/search", label: "Pencarian",  icon: Search    },
]

export default function Navbar() {
  const path = usePathname()

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-4 px-4 md:px-6 py-0"
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        height: 56,
      }}
    >
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2.5 shrink-0">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }}
        >
          <Trophy size={14} className="text-white" />
        </div>
        <span className="text-sm font-bold" style={{ color: "var(--text)" }}>
          <span className="hidden sm:inline">Siswa Berprestasi </span>
          <span className="sm:hidden">SisBer </span>
          <span style={{ color: "var(--muted)", fontWeight: 400 }}>2026</span>
        </span>
      </Link>

      {/* Desktop nav links */}
      <nav className="hidden md:flex items-center gap-1 h-full">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              className="relative flex items-center gap-2 px-4 h-full text-sm font-medium transition-colors"
              style={{ color: active ? "var(--accent)" : "var(--muted)" }}
            >
              <Icon size={15} />
              {label}
              {active && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                  style={{ background: "var(--accent)" }}
                />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Right */}
      <div className="ml-auto flex items-center gap-2">
        <span
          className="hidden sm:inline text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: "rgba(79,70,229,0.08)", color: "var(--accent)" }}
        >
          Information Retrieval
        </span>
        <span className="hidden md:inline text-xs" style={{ color: "var(--muted)" }}>
          914 postingan
        </span>
      </div>
    </header>
  )
}
