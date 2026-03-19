'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import ChatWidget from '@/components/ChatWidget'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠', exact: true },
  { href: '/dashboard/medical-team', label: 'Medical Team', icon: '👩‍⚕️' },
  { href: '/dashboard/documents', label: 'Documents', icon: '📄' },
  { href: '/dashboard/forms', label: 'SSA Forms', icon: '📋' },
  { href: '/dashboard/symptoms', label: 'Symptoms', icon: '📊' },
  { href: '/dashboard/medications', label: 'Medications', icon: '💊' },
  { href: '/dashboard/case-summary', label: 'Case Summary', icon: '✨' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <div className="min-h-screen" style={{ background: '#FAFAF9' }}>
      {/* Top nav bar */}
      <header className="sticky top-0 z-50 border-b" style={{ background: '#1E3A5F', borderColor: '#163050' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              className="sm:hidden text-white p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/dashboard" className="flex items-center gap-2 text-white font-semibold text-lg">
              <span>📋</span>
              <span>CaseBuilder</span>
            </Link>
          </div>

          <nav className="hidden sm:flex items-center gap-1">
            {navItems.slice(1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  color: isActive(item) ? '#fff' : 'rgba(255,255,255,0.7)',
                  background: isActive(item) ? 'rgba(255,255,255,0.15)' : 'transparent',
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="text-sm font-medium px-3 py-1.5 rounded-lg"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Sign out
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t px-4 py-3 space-y-1" style={{ background: '#163050', borderColor: '#12283f' }}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                style={{
                  color: isActive(item) ? '#fff' : 'rgba(255,255,255,0.75)',
                  background: isActive(item) ? 'rgba(255,255,255,0.15)' : 'transparent',
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Floating chat assistant */}
      <ChatWidget />
    </div>
  )
}
